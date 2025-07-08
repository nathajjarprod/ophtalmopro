using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OphtalmoPro.EidBridge.Utils;
using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace OphtalmoPro.EidBridge
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Configuration des logs
            var logPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "OphtalmoPro", "eID-Bridge", "Logs"
            );
            Directory.CreateDirectory(logPath);

            try
            {
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                // Log critique au démarrage
                File.AppendAllText(
                    Path.Combine(logPath, "startup-error.log"),
                    $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} CRITICAL: {ex}\n"
                );
                throw;
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseWindowsService() // Support service Windows
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    
                    // Configuration HTTPS avec certificat auto-généré
                    webBuilder.ConfigureKestrel(options =>
                    {
                        // Port HTTPS sécurisé
                        options.ListenLocalhost(8443, listenOptions =>
                        {
                            listenOptions.UseHttps(GetOrCreateCertificate());
                        });
                        
                        // Désactiver HTTP pour la sécurité
                        options.ConfigureEndpointDefaults(endpointOptions =>
                        {
                            endpointOptions.Protocols = HttpProtocols.Http2;
                        });
                    });
                })
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    logging.AddEventLog(); // Logs Windows Event Log
                });

        private static X509Certificate2 GetOrCreateCertificate()
        {
            var certPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "OphtalmoPro", "eID-Bridge", "Certificates"
            );
            Directory.CreateDirectory(certPath);
            
            var certFile = Path.Combine(certPath, "bridge-cert.pfx");
            
            if (File.Exists(certFile))
            {
                try
                {
                    return new X509Certificate2(certFile, "OphtalmoPro2024!");
                }
                catch
                {
                    // Certificat corrompu, le régénérer
                    File.Delete(certFile);
                }
            }
            
            // Générer un nouveau certificat auto-signé
            return CertificateGenerator.CreateSelfSignedCertificate(certFile);
        }
    }
}