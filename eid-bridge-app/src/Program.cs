using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OphtalmoPro.EidBridge.Utils;
using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.DependencyInjection;
using OphtalmoPro.EidBridge.Services;

namespace OphtalmoPro.EidBridge
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
    
            var logPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "OphtalmoPro", "eID-Bridge", "Logs"
            );

            try
            {
                Directory.CreateDirectory(logPath);

                var certDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                    "OphtalmoPro", "eID-Bridge", "Certificates"
                );
                Directory.CreateDirectory(certDir);

                Console.WriteLine("🚀 Démarrage de OphtalmoPro eID Bridge...");
                Console.WriteLine($"📁 Logs: {logPath}");
                Console.WriteLine($"🔐 Certificats: {certDir}");

                var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "https://localhost:8443";
                Console.WriteLine($"🌐 URLs configurées: {urls}");

                // 🔐 Chargement ou création du certificat SSL
                var cert = GetOrCreateCertificate();

                // 🚀 Démarrage de l'hôte ASP.NET
                var host = CreateHostBuilder(args, cert).Build();

                AppDomain.CurrentDomain.ProcessExit += (_, __) =>
                {
                    Console.WriteLine("🧹 Nettoyage à la fermeture...");
                    using var scope = host.Services.CreateScope();
                    var service = scope.ServiceProvider.GetService<IEidDataService>();
                    if (service is IDisposable disposableService)
                    {
                        disposableService.Dispose(); // Stoppe proprement Manager (Swelio)
                    }
                };

                host.Run();
            }
            catch (Exception ex)
            {
                var errorLogPath = Path.Combine(logPath, "startup-error.log");
                try
                {
                    File.AppendAllText(errorLogPath, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} CRITICAL: {ex}\n");
                }
                catch
                {
                    Console.WriteLine($"ERREUR CRITIQUE: {ex}");
                }

                Console.WriteLine($"❌ Erreur au démarrage: {ex.Message}");
                Console.WriteLine("Appuyez sur une touche pour continuer...");
                Console.ReadKey();
                Environment.Exit(1);
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args, X509Certificate2 serverCert) =>
            Host.CreateDefaultBuilder(args)
                .UseWindowsService()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    webBuilder.ConfigureKestrel(options =>
                    {
                        options.ConfigureHttpsDefaults(httpsOptions =>
                        {
                            httpsOptions.ServerCertificate = serverCert;
                        });

                        options.ConfigureEndpointDefaults(endpointOptions =>
                        {
                            endpointOptions.Protocols = HttpProtocols.Http1AndHttp2;
                        });
                    });
                })
                .ConfigureServices(services =>
                {
                    services.AddSingleton<IEidDataService, EidDataService>(); // Injection du service eID
                })
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    if (OperatingSystem.IsWindows())
                    {
                        try { logging.AddEventLog(); } catch { }
                    }
                });

        private static X509Certificate2 GetOrCreateCertificate()
        {
            var certPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "OphtalmoPro", "eID-Bridge", "Certificates"
            );

            Directory.CreateDirectory(certPath);
            var certFile = Path.Combine(certPath, "bridge-cert.pfx");

            Console.WriteLine($"🔍 Vérification du certificat: {certFile}");

            if (File.Exists(certFile))
            {
                try
                {
                    var existingCert = X509Certificate2.CreateFromEncryptedPemFile(certFile, "OphtalmoPro2024!");
                    if (existingCert.NotAfter > DateTime.Now.AddDays(30))
                    {
                        Console.WriteLine("✅ Certificat existant valide trouvé");
                        return existingCert;
                    }

                    Console.WriteLine("⚠️ Certificat expiré, génération d’un nouveau...");
                    File.Delete(certFile);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Certificat corrompu ({ex.Message}), génération d’un nouveau...");
                    try { File.Delete(certFile); } catch { }
                }
            }

            Console.WriteLine("🔧 Génération d’un nouveau certificat auto-signé...");
            try
            {
                var newCert = CertificateGenerator.CreateSelfSignedCertificate(certFile);
                Console.WriteLine("✅ Nouveau certificat généré avec succès");
                return newCert;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur de génération: {ex.Message}");
                throw new InvalidOperationException("Impossible de créer le certificat SSL", ex);
            }
        }
    }
}
