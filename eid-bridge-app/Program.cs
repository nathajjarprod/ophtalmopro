using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace EidBridge
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("🚀 Démarrage de eID Bridge...");
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }

    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });

            services.AddControllers();
            services.AddSingleton<EidService>();
            services.AddHttpClient();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors();
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGet("/", async context =>
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.WriteAsync(@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>eID Bridge</title>
                            <style>
                                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                                .status { padding: 15px; border-radius: 5px; margin: 10px 0; }
                                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                                .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
                            </style>
                        </head>
                        <body>
                            <h1>eID Bridge</h1>
                            <div class='status success'>
                                ✅ Service opérationnel
                            </div>
                            <div class='status info'>
                                📡 API disponible sur : <strong>/api/</strong><br>
                                📊 Statut : <a href='/api/status'>Vérifier</a><br>
                                👤 Lecture carte : <a href='/api/read-card'>Lire carte</a>
                            </div>
                            <p>Version : 1.0.0</p>
                        </body>
                        </html>");
                });
            });
        }
    }

    public class EidService
    {
        private readonly ILogger<EidService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly int[] _middlewarePorts = { 53001, 35963, 35964, 24727 };
        private int? _workingPort = null;

        public EidService(ILogger<EidService> logger, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> IsMiddlewareAvailable()
        {
            if (_workingPort.HasValue)
            {
                // Tester le port connu en premier
                if (await TestPort(_workingPort.Value))
                {
                    return true;
                }
                _workingPort = null;
            }

            // Tester tous les ports possibles
            foreach (var port in _middlewarePorts)
            {
                if (await TestPort(port))
                {
                    _workingPort = port;
                    _logger.LogInformation($"Middleware eID trouvé sur le port {port}");
                    return true;
                }
            }

            _logger.LogWarning("Aucun middleware eID trouvé");
            return false;
        }

        private async Task<bool> TestPort(int port)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(2);
                var response = await client.GetAsync($"http://localhost:{port}/service/info");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<object> GetReaders()
        {
            if (!_workingPort.HasValue && !await IsMiddlewareAvailable())
            {
                throw new Exception("Middleware eID non disponible");
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync($"http://localhost:{_workingPort}/readers");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<object>(content);
                }
                
                throw new Exception($"Erreur lors de la récupération des lecteurs: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des lecteurs");
                throw;
            }
        }

        public async Task<object> ReadCard(bool includePhoto = false, bool includeAddress = true)
        {
            if (!_workingPort.HasValue && !await IsMiddlewareAvailable())
            {
                throw new Exception("Middleware eID non disponible");
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(30); // Lecture de carte peut prendre du temps

                // Lire l'identité (obligatoire)
                var identityResponse = await client.GetAsync($"http://localhost:{_workingPort}/identity");
                if (!identityResponse.IsSuccessStatusCode)
                {
                    throw new Exception($"Erreur lors de la lecture de l'identité: {identityResponse.StatusCode}");
                }

                var identityContent = await identityResponse.Content.ReadAsStringAsync();
                var identity = JsonSerializer.Deserialize<JsonElement>(identityContent);

                // Préparer le résultat
                var result = new
                {
                    firstName = GetJsonValue(identity, "first_name", "firstName", "given_name"),
                    lastName = GetJsonValue(identity, "last_name", "lastName", "surname"),
                    dateOfBirth = FormatDate(GetJsonValue(identity, "date_of_birth", "dateOfBirth", "birth_date")),
                    placeOfBirth = GetJsonValue(identity, "place_of_birth", "placeOfBirth", "birth_place"),
                    nationality = GetJsonValue(identity, "nationality", "nationalite"),
                    niss = FormatNiss(GetJsonValue(identity, "national_number", "niss", "rrn")),
                    cardNumber = GetJsonValue(identity, "card_number", "cardNumber", "chip_number"),
                    validityBeginDate = FormatDate(GetJsonValue(identity, "validity_begin_date", "validityBeginDate", "valid_from")),
                    validityEndDate = FormatDate(GetJsonValue(identity, "validity_end_date", "validityEndDate", "valid_until")),
                    address = new {},
                    photo = ""
                };

                // Lire l'adresse si demandée
                if (includeAddress)
                {
                    try
                    {
                        var addressResponse = await client.GetAsync($"http://localhost:{_workingPort}/address");
                        if (addressResponse.IsSuccessStatusCode)
                        {
                            var addressContent = await addressResponse.Content.ReadAsStringAsync();
                            var address = JsonSerializer.Deserialize<JsonElement>(addressContent);
                            
                            var addressObj = new
                            {
                                street = GetJsonValue(address, "street_and_number", "street", "rue"),
                                postalCode = GetJsonValue(address, "zip_code", "postalCode", "postal_code"),
                                city = GetJsonValue(address, "municipality", "city", "ville"),
                                country = GetJsonValue(address, "country") ?? "Belgique"
                            };

                            // Mettre à jour le résultat avec l'adresse
                            result = result with { address = addressObj };
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
                        var photoResponse = await client.GetAsync($"http://localhost:{_workingPort}/photo");
                        if (photoResponse.IsSuccessStatusCode)
                        {
                            var contentType = photoResponse.Content.Headers.ContentType?.MediaType;
                            
                            if (contentType?.Contains("application/json") == true)
                            {
                                var photoContent = await photoResponse.Content.ReadAsStringAsync();
                                var photoData = JsonSerializer.Deserialize<JsonElement>(photoContent);
                                var photoBase64 = GetJsonValue(photoData, "photo", "image");
                                
                                // Mettre à jour le résultat avec la photo
                                result = result with { photo = photoBase64 };
                            }
                            else if (contentType?.Contains("image/") == true)
                            {
                                var photoBytes = await photoResponse.Content.ReadAsByteArrayAsync();
                                var photoBase64 = Convert.ToBase64String(photoBytes);
                                
                                // Mettre à jour le résultat avec la photo
                                result = result with { photo = photoBase64 };
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

        private string GetJsonValue(JsonElement element, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (element.TryGetProperty(propertyName, out var property))
                {
                    return property.GetString() ?? "";
                }
            }
            return "";
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