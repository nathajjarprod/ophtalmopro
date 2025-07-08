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
            
            try
            {
                // Créer les répertoires nécessaires avant de démarrer
                Directory.CreateDirectory(logPath);
                
                // Créer le répertoire des certificats
                var certDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                    "OphtalmoPro", "eID-Bridge", "Certificates"
                );
                Directory.CreateDirectory(certDir);
                
                Console.WriteLine($"Démarrage de OphtalmoPro eID Bridge...");
                Console.WriteLine($"Logs: {logPath}");
                Console.WriteLine($"Certificats: {certDir}");
                
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                // Log critique au démarrage
                var errorLogPath = Path.Combine(logPath, "startup-error.log");
                try
                {
                    File.AppendAllText(errorLogPath, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} CRITICAL: {ex}\n");
                }
                catch
                {
                    // Si on ne peut même pas écrire le log, afficher dans la console
                    Console.WriteLine($"ERREUR CRITIQUE: {ex}");
                }
                
                Console.WriteLine($"Erreur au démarrage: {ex.Message}");
                Console.WriteLine("Appuyez sur une touche pour continuer...");
                Console.ReadKey();
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
                        
                        // Configuration des protocoles
                        options.ConfigureEndpointDefaults(endpointOptions =>
                        {
                            endpointOptions.Protocols = HttpProtocols.Http1AndHttp2;
                        });
                    });
                })
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    
                    // Ajouter EventLog seulement si on est en service Windows
                    try
                    {
                        logging.AddEventLog();
                    }
                    catch
                    {
                        // Ignorer si EventLog n'est pas disponible
                    }
                });

        private static X509Certificate2 GetOrCreateCertificate()
        {
            var certPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "OphtalmoPro", "eID-Bridge", "Certificates"
            );
            
            // Créer le répertoire s'il n'existe pas
            Directory.CreateDirectory(certPath);
            
            var certFile = Path.Combine(certPath, "bridge-cert.pfx");
            
            Console.WriteLine($"Vérification du certificat: {certFile}");
            
            if (File.Exists(certFile))
            {
                try
                {
                    var existingCert = new X509Certificate2(certFile, "OphtalmoPro2024!");
                    
                    // Vérifier si le certificat n'est pas expiré
                    if (existingCert.NotAfter > DateTime.Now.AddDays(30))
                    {
                        Console.WriteLine("✅ Certificat existant valide trouvé");
                        return existingCert;
                    }
                    else
                    {
                        Console.WriteLine("⚠️ Certificat expiré, génération d'un nouveau...");
                        File.Delete(certFile);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Certificat corrompu ({ex.Message}), génération d'un nouveau...");
                    try
                    {
                        File.Delete(certFile);
                    }
                    catch
                    {
                        // Ignorer si on ne peut pas supprimer
                    }
                }
            }
            
            // Générer un nouveau certificat auto-signé
            Console.WriteLine("🔧 Génération d'un nouveau certificat auto-signé...");
            try
            {
                var newCert = CertificateGenerator.CreateSelfSignedCertificate(certFile);
                Console.WriteLine("✅ Nouveau certificat généré avec succès");
                return newCert;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur lors de la génération du certificat: {ex.Message}");
                throw new InvalidOperationException($"Impossible de créer le certificat SSL: {ex.Message}", ex);
            }
        }
    }
}