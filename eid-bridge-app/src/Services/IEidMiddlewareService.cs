using OphtalmoPro.EidBridge.Models;

namespace OphtalmoPro.EidBridge.Services
{
    public interface IEidMiddlewareService
    {
        Task<bool> IsAvailableAsync();
        Task<string> GetVersionAsync();
        Task<List<CardReader>> GetReadersAsync();
        Task<EidData> ReadCardAsync(string readerName, EidReadOptions options);
        Task<MiddlewareDiagnostic> GetDiagnosticAsync();
    }

    public class EidMiddlewareService : IEidMiddlewareService
    {
        private readonly ILogger<EidMiddlewareService> _logger;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly int[] _testPorts;

        public EidMiddlewareService(ILogger<EidMiddlewareService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
            _testPorts = _configuration.GetSection("EidBridge:Middleware:TestPorts").Get<int[]>() ?? new[] { 53001, 35963, 35964, 24727 };
        }

        public async Task<bool> IsAvailableAsync()
        {
            foreach (var port in _testPorts)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{port}/service/info");
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Middleware eID trouvé sur le port {Port}", port);
                        return true;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Port {Port} non accessible", port);
                }
            }

            _logger.LogWarning("Aucun middleware eID trouvé sur les ports testés");
            return false;
        }

        public async Task<string> GetVersionAsync()
        {
            foreach (var port in _testPorts)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{port}/service/info");
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var serviceInfo = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(content);
                        
                        if (serviceInfo?.ContainsKey("version") == true)
                        {
                            return serviceInfo["version"]?.ToString() ?? "Inconnue";
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Erreur lors de la récupération de version sur port {Port}", port);
                }
            }

            return "Inconnue";
        }

        public async Task<List<CardReader>> GetReadersAsync()
        {
            var readers = new List<CardReader>();

            foreach (var port in _testPorts)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{port}/readers");
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var readerData = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(content);
                        
                        if (readerData != null)
                        {
                            foreach (var reader in readerData)
                            {
                                readers.Add(new CardReader
                                {
                                    Name = reader.GetValueOrDefault("name", "Lecteur inconnu")?.ToString() ?? "Lecteur inconnu",
                                    HasCard = bool.Parse(reader.GetValueOrDefault("card_present", false)?.ToString() ?? "false"),
                                    IsConnected = true,
                                    Status = "Connected",
                                    Driver = "PC/SC",
                                    LastActivity = DateTime.Now
                                });
                            }
                        }
                        break; // Sortir dès qu'on trouve un port qui fonctionne
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Erreur lors de la récupération des lecteurs sur port {Port}", port);
                }
            }

            return readers;
        }

        public async Task<EidData> ReadCardAsync(string readerName, EidReadOptions options)
        {
            foreach (var port in _testPorts)
            {
                try
                {
                    // Lire l'identité
                    var identityResponse = await _httpClient.GetAsync($"http://localhost:{port}/identity");
                    if (!identityResponse.IsSuccessStatusCode) continue;

                    var identityContent = await identityResponse.Content.ReadAsStringAsync();
                    var identity = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(identityContent);

                    var eidData = new EidData
                    {
                        FirstName = identity?.GetValueOrDefault("first_name", "")?.ToString() ?? "",
                        LastName = identity?.GetValueOrDefault("last_name", "")?.ToString() ?? "",
                        DateOfBirth = identity?.GetValueOrDefault("date_of_birth", "")?.ToString() ?? "",
                        PlaceOfBirth = identity?.GetValueOrDefault("place_of_birth", "")?.ToString() ?? "",
                        Nationality = identity?.GetValueOrDefault("nationality", "")?.ToString() ?? "",
                        Niss = identity?.GetValueOrDefault("national_number", "")?.ToString() ?? "",
                        CardNumber = identity?.GetValueOrDefault("card_number", "")?.ToString() ?? "",
                        ValidityBeginDate = identity?.GetValueOrDefault("validity_begin_date", "")?.ToString() ?? "",
                        ValidityEndDate = identity?.GetValueOrDefault("validity_end_date", "")?.ToString() ?? "",
                        Address = new EidAddress
                        {
                            Street = "",
                            PostalCode = "",
                            City = "",
                            Country = "Belgique"
                        }
                    };

                    // Lire l'adresse si demandée
                    if (options.IncludeAddress)
                    {
                        try
                        {
                            var addressResponse = await _httpClient.GetAsync($"http://localhost:{port}/address");
                            if (addressResponse.IsSuccessStatusCode)
                            {
                                var addressContent = await addressResponse.Content.ReadAsStringAsync();
                                var address = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(addressContent);
                                
                                eidData.Address = new EidAddress
                                {
                                    Street = address?.GetValueOrDefault("street_and_number", "")?.ToString() ?? "",
                                    PostalCode = address?.GetValueOrDefault("zip_code", "")?.ToString() ?? "",
                                    City = address?.GetValueOrDefault("municipality", "")?.ToString() ?? "",
                                    Country = address?.GetValueOrDefault("country", "Belgique")?.ToString() ?? "Belgique"
                                };
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Impossible de lire l'adresse");
                        }
                    }

                    // Lire la photo si demandée
                    if (options.IncludePhoto)
                    {
                        try
                        {
                            var photoResponse = await _httpClient.GetAsync($"http://localhost:{port}/photo");
                            if (photoResponse.IsSuccessStatusCode)
                            {
                                var photoBytes = await photoResponse.Content.ReadAsByteArrayAsync();
                                eidData.Photo = Convert.ToBase64String(photoBytes);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Impossible de lire la photo");
                        }
                    }

                    return eidData;
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Erreur lors de la lecture sur port {Port}", port);
                }
            }

            throw new MiddlewareException("Impossible de lire la carte eID sur aucun port");
        }

        public async Task<MiddlewareDiagnostic> GetDiagnosticAsync()
        {
            var diagnostic = new MiddlewareDiagnostic
            {
                TestedPorts = _testPorts.Select(p => p.ToString()).ToList(),
                IsAvailable = false
            };

            foreach (var port in _testPorts)
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://localhost:{port}/service/info");
                    if (response.IsSuccessStatusCode)
                    {
                        diagnostic.IsAvailable = true;
                        diagnostic.WorkingPort = port.ToString();
                        
                        var content = await response.Content.ReadAsStringAsync();
                        var serviceInfo = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(content);
                        
                        diagnostic.Version = serviceInfo?.GetValueOrDefault("version", "")?.ToString();
                        diagnostic.ServiceName = serviceInfo?.GetValueOrDefault("name", "eID Middleware")?.ToString();
                        break;
                    }
                }
                catch (Exception ex)
                {
                    diagnostic.LastError = ex.Message;
                }
            }

            return diagnostic;
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}