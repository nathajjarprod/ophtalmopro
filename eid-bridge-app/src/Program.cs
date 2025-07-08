using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OphtalmoPro.EidBridge.Utils;
using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using System.Net;
using System.Net.NetworkInformation;

namespace OphtalmoPro.EidBridge
{
    public class Program
    {
        private static int _selectedPort = 8443;
        
        public static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            
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
                
                Console.WriteLine($"🚀 Démarrage de OphtalmoPro eID Bridge...");
                Console.WriteLine($"📁 Logs: {logPath}");
                Console.WriteLine($"🔐 Certificats: {certDir}");
                
                // Vérifier et trouver un port disponible
                _selectedPort = FindAvailablePort(9597);
                Console.WriteLine($"🌐 Port sélectionné: {_selectedPort}");
                
                // Attendre un peu pour s'assurer que le port est vraiment libre
                Console.WriteLine("⏳ Vérification finale du port...");
                System.Threading.Thread.Sleep(1000);
                
                if (!IsPortAvailable(_selectedPort))
                {
                    throw new InvalidOperationException($"Le port {_selectedPort} est devenu indisponible");
                }
                
                // Stocker le port sélectionné pour Kestrel
                Environment.SetEnvironmentVariable("SELECTED_PORT", _selectedPort.ToString());
                
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
                
                Console.WriteLine($"❌ Erreur au démarrage: {ex.Message}");
                Console.WriteLine("Appuyez sur une touche pour continuer...");
                Console.ReadKey();
                Environment.Exit(1);
            }
        }

        private static int FindAvailablePort(int preferredPort)
        {
            // Tester le port préféré d'abord
            if (IsPortAvailable(preferredPort))
            {
                Console.WriteLine($"✅ Port {preferredPort} disponible");
                return preferredPort;
            }

            Console.WriteLine($"⚠️ Port {preferredPort} déjà utilisé, recherche d'un port alternatif...");

            // Tester des ports alternatifs
            var alternativePorts = new[] { 9598, 9599, 9600, 9601, 9602, 9603, 9604 };
            
            foreach (var port in alternativePorts)
            {
                if (IsPortAvailable(port))
                {
                    Console.WriteLine($"✅ Port alternatif trouvé: {port}");
                    return port;
                }
                Console.WriteLine($"❌ Port {port} également utilisé");
            }

            // Si aucun port fixe n'est disponible, trouver un port libre automatiquement
            var listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            var dynamicPort = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            
            Console.WriteLine($"🔄 Utilisation du port dynamique: {dynamicPort}");
            return dynamicPort;
        }

        private static bool IsPortAvailable(int port)
        {
            // Test multiple pour s'assurer que le port est vraiment libre
            try
            {
                // Test 1: Vérifier avec IPGlobalProperties
                var ipGlobalProperties = IPGlobalProperties.GetIPGlobalProperties();
                var tcpConnInfoArray = ipGlobalProperties.GetActiveTcpListeners();

                foreach (var endpoint in tcpConnInfoArray)
                {
                    if (endpoint.Port == port)
                    {
                        return false;
                    }
                }

                // Test 2: Essayer de créer un TcpListener
                var listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback, port);
                listener.Start();
                
                // Test 3: Attendre un peu et vérifier à nouveau
                System.Threading.Thread.Sleep(100);
                
                listener.Stop();
                
                // Test 4: Vérifier qu'aucun processus n'utilise le port après fermeture
                System.Threading.Thread.Sleep(100);
                
                var tcpConnInfoArray2 = ipGlobalProperties.GetActiveTcpListeners();
                foreach (var endpoint in tcpConnInfoArray2)
                {
                    if (endpoint.Port == port)
                    {
                        Console.WriteLine($"⚠️ Port {port} encore en cours d'utilisation après test");
                        return false;
                    }
                }
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur lors du test du port {port}: {ex.Message}");
                return false;
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
                        // Utiliser le port détecté dynamiquement
                        var port = int.Parse(Environment.GetEnvironmentVariable("SELECTED_PORT") ?? "9597");
                        
                        // Port HTTPS sécurisé
                        options.ListenLocalhost(port, listenOptions =>
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
            
            Console.WriteLine($"🔍 Vérification du certificat: {certFile}");
            
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