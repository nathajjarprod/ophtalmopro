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
                _selectedPort = FindAvailablePort(8443);
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
            // Attendre un peu au cas où un processus serait en train de se fermer
            System.Threading.Thread.Sleep(2000);
            
            // Tester le port préféré d'abord
            if (IsPortAvailable(preferredPort))
            {
                Console.WriteLine($"✅ Port {preferredPort} disponible");
                return preferredPort;
            }

            Console.WriteLine($"⚠️ Port {preferredPort} déjà utilisé, recherche d'un port alternatif...");

            // Diagnostic du port occupé
            DiagnosePortUsage(preferredPort);
            
            // Tenter de libérer le port si possible
            if (TryFreePort(preferredPort))
            {
                System.Threading.Thread.Sleep(1000);
                if (IsPortAvailable(preferredPort))
                {
                    Console.WriteLine($"✅ Port {preferredPort} libéré avec succès");
                    return preferredPort;
                }
            }
            
            // Tester des ports alternatifs dans une plage plus large
            var alternativePorts = new[] { 8444, 8445, 8446, 8447, 8448, 8449, 8450, 9597, 9598, 9599 };
            
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

        private static void DiagnosePortUsage(int port)
        {
            try
            {
                Console.WriteLine($"🔍 Diagnostic du port {port}...");
                
                // Utiliser netstat pour trouver qui utilise le port
                var processInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "netstat",
                    Arguments = "-ano",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                
                using (var process = System.Diagnostics.Process.Start(processInfo))
                {
                    if (process != null)
                    {
                        var output = process.StandardOutput.ReadToEnd();
                        var lines = output.Split('\n');
                        
                        foreach (var line in lines)
                        {
                            if (line.Contains($":{port} "))
                            {
                                Console.WriteLine($"   Port utilisé: {line.Trim()}");
                                
                                // Extraire le PID
                                var parts = line.Trim().Split(new char[0], StringSplitOptions.RemoveEmptyEntries);
                                if (parts.Length > 4)
                                {
                                    var pid = parts[4];
                                    try
                                    {
                                        var proc = System.Diagnostics.Process.GetProcessById(int.Parse(pid));
                                        Console.WriteLine($"   Processus: {proc.ProcessName} (PID: {pid})");
                                    }
                                    catch
                                    {
                                        Console.WriteLine($"   PID: {pid} (processus non accessible)");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   Erreur diagnostic: {ex.Message}");
            }
        }
        
        private static bool TryFreePort(int port)
        {
            try
            {
                Console.WriteLine($"🔧 Tentative de libération du port {port}...");
                
                // Méthode 1: Tuer les processus dotnet
                var dotnetProcesses = System.Diagnostics.Process.GetProcessesByName("dotnet");
                foreach (var proc in dotnetProcesses)
                {
                    try
                    {
                        Console.WriteLine($"   Arrêt du processus dotnet PID: {proc.Id}");
                        proc.Kill();
                        proc.WaitForExit(2000);
                    }
                    catch
                    {
                        // Ignorer les erreurs
                    }
                }
                
                // Méthode 2: Tuer les processus OphtalmoPro
                var ophtalmoProcesses = System.Diagnostics.Process.GetProcessesByName("OphtalmoPro.EidBridge");
                foreach (var proc in ophtalmoProcesses)
                {
                    try
                    {
                        Console.WriteLine($"   Arrêt du processus OphtalmoPro PID: {proc.Id}");
                        proc.Kill();
                        proc.WaitForExit(2000);
                    }
                    catch
                    {
                        // Ignorer les erreurs
                    }
                }
                
                // Attendre un peu
                System.Threading.Thread.Sleep(1000);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   Erreur libération: {ex.Message}");
                return false;
            }
        }

        private static bool IsPortAvailable(int port)
        {
            // Test multiple et plus robuste pour s'assurer que le port est vraiment libre
            try
            {
                // Test 1: Vérifier avec IPGlobalProperties (listeners actifs)
                var ipGlobalProperties = IPGlobalProperties.GetIPGlobalProperties();
                var tcpConnInfoArray = ipGlobalProperties.GetActiveTcpListeners();

                foreach (var endpoint in tcpConnInfoArray)
                {
                    if (endpoint.Port == port)
                    {
                        return false;
                    }
                }

                // Test 2: Vérifier les connexions TCP actives
                var tcpConnections = ipGlobalProperties.GetActiveTcpConnections();
                foreach (var connection in tcpConnections)
                {
                    if (connection.LocalEndPoint.Port == port)
                    {
                        Console.WriteLine($"   Port {port} utilisé par une connexion active: {connection.State}");
                        return false;
                    }
                }

                // Test 3: Essayer de créer un TcpListener
                var listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback, port);
                listener.Start();
                
                // Test 4: Attendre un peu et vérifier à nouveau
                System.Threading.Thread.Sleep(200);
                
                listener.Stop();
                
                // Test 5: Vérifier qu'aucun processus n'utilise le port après fermeture
                System.Threading.Thread.Sleep(200);
                
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
                Console.WriteLine($"   Erreur test port {port}: {ex.Message}");
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
                        var port = int.Parse(Environment.GetEnvironmentVariable("SELECTED_PORT") ?? "8443");
                        
                        // Configuration port unique HTTPS seulement
                        options.ListenLocalhost(port, listenOptions =>
                        {
                            listenOptions.UseHttps(GetOrCreateCertificate());
                            listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
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