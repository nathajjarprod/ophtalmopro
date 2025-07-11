using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace OphtalmoPro.EidBridge.Services
{
    public class EidService
    {
        private readonly ILogger<EidService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string[] _middlewarePorts = { "53001", "35963", "35964", "24727" };
        private string? _workingPort = null;

        public EidService(ILogger<EidService> logger)
        {
            _logger = logger;
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(30)
            };
        }

        public async Task<bool> IsMiddlewareAvailable()
        {
            if (_workingPort != null)
            {
                // Tester le port connu en premier
                if (await TestMiddlewarePort(_workingPort))
                {
                    return true;
                }
                else
                {
                    _workingPort = null; // Reset si le port ne fonctionne plus
                }
            }

            // Tester tous les ports possibles
            foreach (var port in _middlewarePorts)
            {
                if (await TestMiddlewarePort(port))
                {
                    _workingPort = port;
                    _logger.LogInformation("Middleware eID trouvé sur le port {Port}", port);
                    return true;
                }
            }

            _logger.LogWarning("Aucun middleware eID trouvé sur les ports testés");
            return false;
        }

        private async Task<bool> TestMiddlewarePort(string port)
        {
            try
            {
                var response = await _httpClient.GetAsync($"http://localhost:{port}/service/info");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<object>> GetReaders()
        {
            if (!await IsMiddlewareAvailable())
            {
                throw new Exception("Middleware eID non disponible");
            }

            try
            {
                var response = await _httpClient.GetAsync($"http://localhost:{_workingPort}/readers");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<object>>(content) ?? new List<object>();
                }
                
                throw new Exception("Impossible de récupérer les lecteurs");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des lecteurs");
                throw;
            }
        }

        public async Task<object> ReadCard(bool includePhoto = false, bool includeAddress = true)
        {
            if (!await IsMiddlewareAvailable())
            {
                throw new Exception("Middleware eID non disponible");
            }

            try
            {
                // Lire l'identité
                var identityResponse = await _httpClient.GetAsync($"http://localhost:{_workingPort}/identity");
                if (!identityResponse.IsSuccessStatusCode)
                {
                    throw new Exception("Impossible de lire l'identité");
                }

                var identityContent = await identityResponse.Content.ReadAsStringAsync();
                var identity = JsonSerializer.Deserialize<JsonElement>(identityContent);

                // Préparer le résultat
                var result = new
                {
                    FirstName = GetJsonValue(identity, "first_name", "firstName", "given_name") ?? "",
                    LastName = GetJsonValue(identity, "last_name", "lastName", "surname") ?? "",
                    DateOfBirth = FormatDate(GetJsonValue(identity, "date_of_birth", "dateOfBirth", "birth_date") ?? ""),
                    PlaceOfBirth = GetJsonValue(identity, "place_of_birth", "placeOfBirth", "birth_place") ?? "",
                    Nationality = GetJsonValue(identity, "nationality", "nationalite") ?? "",
                    Niss = FormatNiss(GetJsonValue(identity, "national_number", "niss", "rrn") ?? ""),
                    CardNumber = GetJsonValue(identity, "card_number", "cardNumber", "chip_number") ?? "",
                    ValidityBeginDate = FormatDate(GetJsonValue(identity, "validity_begin_date", "validityBeginDate", "valid_from") ?? ""),
                    ValidityEndDate = FormatDate(GetJsonValue(identity, "validity_end_date", "validityEndDate", "valid_until") ?? ""),
                    Address = new
                    {
                        Street = "",
                        PostalCode = "",
                        City = "",
                        Country = "Belgique"
                    },
                    Photo = (string?)null
                };

                // Lire l'adresse si demandée
                if (includeAddress)
                {
                    try
                    {
                        var addressResponse = await _httpClient.GetAsync($"http://localhost:{_workingPort}/address");
                        if (addressResponse.IsSuccessStatusCode)
                        {
                            var addressContent = await addressResponse.Content.ReadAsStringAsync();
                            var address = JsonSerializer.Deserialize<JsonElement>(addressContent);
                            
                            result = result with
                            {
                                Address = new
                                {
                                    Street = GetJsonValue(address, "street_and_number", "street", "rue") ?? "",
                                    PostalCode = GetJsonValue(address, "zip_code", "postalCode", "postal_code") ?? "",
                                    City = GetJsonValue(address, "municipality", "city", "ville") ?? "",
                                    Country = GetJsonValue(address, "country") ?? "Belgique"
                                }
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Impossible de lire l'adresse");
                    }
                }

                // Lire la photo si demandée
                if (includePhoto)
                {
                    try
                    {
                        var photoResponse = await _httpClient.GetAsync($"http://localhost:{_workingPort}/photo");
                        if (photoResponse.IsSuccessStatusCode)
                        {
                            var contentType = photoResponse.Content.Headers.ContentType?.MediaType;
                            
                            if (contentType?.Contains("application/json") == true)
                            {
                                var photoContent = await photoResponse.Content.ReadAsStringAsync();
                                var photoData = JsonSerializer.Deserialize<JsonElement>(photoContent);
                                var photoBase64 = GetJsonValue(photoData, "photo", "image");
                                
                                result = result with { Photo = photoBase64 };
                            }
                            else if (contentType?.Contains("image/") == true)
                            {
                                var photoBytes = await photoResponse.Content.ReadAsByteArrayAsync();
                                var photoBase64 = Convert.ToBase64String(photoBytes);
                                
                                result = result with { Photo = photoBase64 };
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Impossible de lire la photo");
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la lecture de la carte");
                throw;
            }
        }

        private string? GetJsonValue(JsonElement element, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (element.TryGetProperty(propertyName, out var property))
                {
                    return property.GetString();
                }
            }
            return null;
        }

        private string FormatDate(string dateString)
        {
            if (string.IsNullOrEmpty(dateString)) return "";
            
            // Si déjà au format DD/MM/YYYY
            if (System.Text.RegularExpressions.Regex.IsMatch(dateString, @"^\d{2}/\d{2}/\d{4}$"))
                return dateString;
            
            // Si au format YYYY-MM-DD
            if (System.Text.RegularExpressions.Regex.IsMatch(dateString, @"^\d{4}-\d{2}-\d{2}$"))
            {
                var parts = dateString.Split('-');
                return $"{parts[2]}/{parts[1]}/{parts[0]}";
            }
            
            // Si au format YYYYMMDD
            if (System.Text.RegularExpressions.Regex.IsMatch(dateString, @"^\d{8}$"))
            {
                return $"{dateString.Substring(6, 2)}/{dateString.Substring(4, 2)}/{dateString.Substring(0, 4)}";
            }
            
            return dateString;
        }

        private string FormatNiss(string niss)
        {
            if (string.IsNullOrEmpty(niss)) return "";
            
            var numbers = System.Text.RegularExpressions.Regex.Replace(niss, @"\D", "");
            
            if (numbers.Length == 11)
            {
                return $"{numbers.Substring(0, 2)}.{numbers.Substring(2, 2)}.{numbers.Substring(4, 2)}-{numbers.Substring(6, 3)}.{numbers.Substring(9, 2)}";
            }
            
            return niss;
        }
    }
}