using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Net;

namespace OphtalmoPro.EidBridge.Utils
{
    public static class CertificateGenerator
    {
        public static X509Certificate2 CreateSelfSignedCertificate(string certPath)
        {
            Console.WriteLine("🔧 Création d'un certificat auto-signé...");
            
            using var rsa = RSA.Create(2048);
            
            var request = new CertificateRequest(
                "CN=OphtalmoPro eID Bridge, O=OphtalmoPro, C=BE",
                rsa,
                HashAlgorithmName.SHA256,
                RSASignaturePadding.Pkcs1
            );

            // Ajouter les extensions pour un certificat SSL
            request.CertificateExtensions.Add(
                new X509KeyUsageExtension(
                    X509KeyUsageFlags.DigitalSignature | X509KeyUsageFlags.KeyEncipherment,
                    critical: true
                )
            );

            request.CertificateExtensions.Add(
                new X509EnhancedKeyUsageExtension(
                    new OidCollection { new Oid("1.3.6.1.5.5.7.3.1") }, // Server Authentication
                    critical: true
                )
            );

            // Créer l'extension SAN (Subject Alternative Name) manuellement pour .NET 6.0
            var sanBuilder = new System.Text.StringBuilder();
            sanBuilder.Append("DNS:localhost");
            sanBuilder.Append(",DNS:127.0.0.1");
            sanBuilder.Append(",IP:127.0.0.1");
            sanBuilder.Append(",IP:::1");

            // Pour .NET 6.0, nous devons créer l'extension SAN différemment
            try
            {
                // Essayer d'utiliser la nouvelle méthode si disponible
                var sanExtension = CreateSubjectAlternativeNameExtension();
                if (sanExtension != null)
                {
                    request.CertificateExtensions.Add(sanExtension);
                }
            }
            catch
            {
                // Fallback pour les versions plus anciennes
                Console.WriteLine("⚠️ Extension SAN avancée non disponible, utilisation du fallback");
            }

            // Créer le certificat auto-signé
            var certificate = request.CreateSelfSigned(
                DateTimeOffset.Now.AddDays(-1),
                DateTimeOffset.Now.AddYears(5)
            );

            // Exporter avec clé privée
            var pfxBytes = certificate.Export(X509ContentType.Pfx, "OphtalmoPro2024!");
            File.WriteAllBytes(certPath, pfxBytes);

            Console.WriteLine($"✅ Certificat sauvegardé: {certPath}");
            Console.WriteLine($"📅 Valide jusqu'au: {certificate.NotAfter:yyyy-MM-dd}");

            return new X509Certificate2(certPath, "OphtalmoPro2024!", X509KeyStorageFlags.PersistKeySet);
        }

        private static X509Extension? CreateSubjectAlternativeNameExtension()
        {
            try
            {
                // Créer une extension SAN basique
                var sanBuilder = new SubjectAlternativeNameBuilder();
                sanBuilder.AddDnsName("localhost");
                sanBuilder.AddIpAddress(IPAddress.Loopback);
                sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
                
                return sanBuilder.Build();
            }
            catch
            {
                // Si SubjectAlternativeNameBuilder n'est pas disponible
                return null;
            }
        }
    }
}