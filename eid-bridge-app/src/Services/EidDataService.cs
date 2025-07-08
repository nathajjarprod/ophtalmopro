using Microsoft.Extensions.Logging;
using OphtalmoPro.EidBridge.Models;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace OphtalmoPro.EidBridge.Services
{
    public interface IEidDataService
    {
        Task<EidData> ReadCardDataAsync(EidReadOptions options);
        Task<bool> CheckMiddlewareStatusAsync();
        Task<MiddlewareDiagnostic> GetMiddlewareDiagnosticAsync();
    }

    public class EidDataService : IEidDataService
    {
        private readonly ILogger<EidDataService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string[] _middlewarePorts = { "53001", "35963", "35964", "24727" };
        private string _workingPort = null;

        public EidDataService(ILogger<EidDataService> logger)
        {
            _logger = logger;
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(30)
            };
        }

        public async Task<EidData> ReadCardDataAsync(EidReadOptions options)
        {
            _logger.LogInformation("Début lecture données carte eID");

            // Vérifier la disponibilité du middleware
            if (!await CheckMiddlewareStatusAsync())
            {
                throw new MiddlewareException("Middleware eID non disponible");
            }

            try
            {
                // Lire les données d'identité (obligatoire)
                var identity = await ReadIdentityAsync();
                
                // Lire l'adresse si demandée
                EidAddress address = null;
                if (options.IncludeAddress)
                {
                    try
                    {
                        address = await ReadAddressAsync();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Impossible de lire l'adresse, continuation sans adresse");
                    }
                }

                // Lire la photo si demandée
                string photo = null;
                if (options.IncludePhoto)
                {
                    try
                    {
                        photo = await ReadPhotoAsync();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Impossible de lire la photo, continuation sans photo");
                    }
                }

                var eidData = new EidData
                {
                    FirstName = identity.FirstName,
                    LastName = identity.LastName,
                    DateOfBirth = FormatDate(identity.DateOfBirth),
                    PlaceOfBirth = identity.PlaceOfBirth,
                    Nationality = identity.Nationality,
                    Niss = FormatNiss(identity.Niss),
                    CardNumber = identity.CardNumber,
                    ValidityBeginDate = FormatDate(identity.ValidityBeginDate),
                    ValidityEndDate = FormatDate(identity.ValidityEndDate),
                    Address = address,
                    Photo = photo
                };

                _logger.LogInformation("Lecture carte eID terminée avec succès pour {FirstName} {LastName}", 
                    eidData.FirstName, eidData.LastName);

                return eidData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la lecture des données eID");
                throw;
            }
        }

        public async Task<bool> CheckMiddlewareStatusAsync()
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

        private async Task<IdentityData> ReadIdentityAsync()
        {
            var endpoints = new[] { "/identity", "/id", "/card/identity" };
            
            foreach (var endpoint in endpoints)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{_workingPort}{endpoint}");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        var rawData = JsonSerializer.Deserialize<JsonElement>(json);
                        
                        return new IdentityData
                        {
                            FirstName = GetJsonValue(rawData, "first_name", "firstName", "given_name"),
                            LastName = GetJsonValue(rawData, "last_name", "lastName", "surname"),
                            DateOfBirth = GetJsonValue(rawData, "date_of_birth", "dateOfBirth", "birth_date"),
                            PlaceOfBirth = GetJsonValue(rawData, "place_of_birth", "placeOfBirth", "birth_place"),
                            Nationality = GetJsonValue(rawData, "nationality", "nationalite"),
                            Niss = GetJsonValue(rawData, "national_number", "niss", "rrn"),
                            CardNumber = GetJsonValue(rawData, "card_number", "cardNumber", "chip_number"),
                            ValidityBeginDate = GetJsonValue(rawData, "validity_begin_date", "validityBeginDate", "valid_from"),
                            ValidityEndDate = GetJsonValue(rawData, "validity_end_date", "validityEndDate", "valid_until")
                        };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Endpoint {Endpoint} non disponible", endpoint);
                }
            }

            throw new MiddlewareException("Impossible de lire les données d'identité");
        }

        private async Task<EidAddress> ReadAddressAsync()
        {
            var endpoints = new[] { "/address", "/addr", "/card/address" };
            
            foreach (var endpoint in endpoints)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{_workingPort}{endpoint}");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        var rawData = JsonSerializer.Deserialize<JsonElement>(json);
                        
                        return new EidAddress
                        {
                            Street = GetJsonValue(rawData, "street_and_number", "street", "rue"),
                            PostalCode = GetJsonValue(rawData, "zip_code", "postalCode", "postal_code"),
                            City = GetJsonValue(rawData, "municipality", "city", "ville"),
                            Country = GetJsonValue(rawData, "country") ?? "Belgique"
                        };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Endpoint adresse {Endpoint} non disponible", endpoint);
                }
            }

            return null; // L'adresse n'est pas critique
        }

        private async Task<string> ReadPhotoAsync()
        {
            var endpoints = new[] { "/photo", "/image", "/card/photo" };
            
            foreach (var endpoint in endpoints)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{_workingPort}{endpoint}");
                    if (response.IsSuccessStatusCode)
                    {
                        var contentType = response.Content.Headers.ContentType?.MediaType;
                        
                        if (contentType?.Contains("application/json") == true)
                        {
                            var json = await response.Content.ReadAsStringAsync();
                            var data = JsonSerializer.Deserialize<JsonElement>(json);
                            return GetJsonValue(data, "photo", "image");
                        }
                        else if (contentType?.Contains("image/") == true)
                        {
                            var imageBytes = await response.Content.ReadAsByteArrayAsync();
                            return Convert.ToBase64String(imageBytes);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Endpoint photo {Endpoint} non disponible", endpoint);
                }
            }

            return null; // La photo n'est pas critique
        }

        public async Task<MiddlewareDiagnostic> GetMiddlewareDiagnosticAsync()
        {
            var diagnostic = new MiddlewareDiagnostic
            {
                TestedPorts = _middlewarePorts.ToList(),
                WorkingPort = _workingPort,
                IsAvailable = _workingPort != null
            };

            if (_workingPort != null)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{_workingPort}/service/info");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        var serviceInfo = JsonSerializer.Deserialize<JsonElement>(json);
                        
                        diagnostic.Version = GetJsonValue(serviceInfo, "version");
                        diagnostic.ServiceName = GetJsonValue(serviceInfo, "name", "service");
                    }
                }
                catch (Exception ex)
                {
                    diagnostic.LastError = ex.Message;
                }
            }

            return diagnostic;
        }

        private string GetJsonValue(JsonElement element, params string[] propertyNames)
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

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }

    // Classes de données internes
    internal class IdentityData
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string DateOfBirth { get; set; }
        public string PlaceOfBirth { get; set; }
        public string Nationality { get; set; }
        public string Niss { get; set; }
        public string CardNumber { get; set; }
        public string ValidityBeginDate { get; set; }
        public string ValidityEndDate { get; set; }
    }

    // Exceptions personnalisées
    public class MiddlewareException : Exception
    {
        public MiddlewareException(string message) : base(message) { }
        public MiddlewareException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class CardNotPresentException : Exception
    {
        public CardNotPresentException(string message) : base(message) { }
    }
}