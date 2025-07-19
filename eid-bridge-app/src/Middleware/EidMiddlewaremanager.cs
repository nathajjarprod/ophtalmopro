using System.Diagnostics;
using System.IO;
using System.Linq;

namespace OphtalmoPro.EidBridge.Utils
{
    public static class EidMiddlewareManager
    {
        public static void EnsureMiddlewareRunning()
        {
            var running = Process.GetProcessesByName("eid-mw-daemon").Any();
            if (running)
            {
                Console.WriteLine("✅ Middleware eID déjà en cours.");
                return;
            }

            // Vérifie installation standard
            var installedPath = @"C:\Program Files (x86)\Belgium Identity Card\EidViewer\eID Viewer.exe";
            if (File.Exists(installedPath))
            {
                Console.WriteLine("🚀 Lancement du middleware installé...");
                Process.Start(new ProcessStartInfo
                {
                    FileName = installedPath,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                });
                return;
            }

            // Fallback : dossier embarqué dans l'app
            var embeddedPath = Path.Combine(AppContext.BaseDirectory, "Resources", "eid-middleware", "win-x64", "eid-mw-daemon.exe");
            if (File.Exists(embeddedPath))
            {
                Console.WriteLine("🚀 Lancement du middleware intégré (embarqué)...");
                Process.Start(new ProcessStartInfo
                {
                    FileName = embeddedPath,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                });
                return;
            }

            Console.WriteLine("❌ Middleware eID introuvable. Veuillez l’installer manuellement : https://eid.belgium.be/fr");
        }
    }
}
