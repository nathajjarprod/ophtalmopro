using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Net;
using System.IO;

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

            request.CertificateExtensions.Add(
                new X509KeyUsageExtension(
                    X509KeyUsageFlags.DigitalSignature | X509KeyUsageFlags.KeyEncipherment,
                    critical: true
                )
            );

            request.CertificateExtensions.Add(
                new X509EnhancedKeyUsageExtension(
                    new OidCollection { new Oid("1.3.6.1.5.5.7.3.1") },
                    critical: true
                )
            );

            try
            {
                var sanExtension = CreateSubjectAlternativeNameExtension();
                if (sanExtension != null)
                {
                    request.CertificateExtensions.Add(sanExtension);
                }
            }
            catch
            {
                Console.WriteLine("⚠️ Extension SAN avancée non disponible, utilisation du fallback");
            }

            var certificate = request.CreateSelfSigned(
                DateTimeOffset.Now.AddDays(-1),
                DateTimeOffset.Now.AddYears(5)
            );

            // Exporter en PFX avec mot de passe
            var pfxBytes = certificate.Export(X509ContentType.Pfx, "OphtalmoPro2024!");
            File.WriteAllBytes(certPath, pfxBytes);

            Console.WriteLine($"✅ Certificat sauvegardé: {certPath}");
            Console.WriteLine($"📅 Valide jusqu'au: {certificate.NotAfter:yyyy-MM-dd}");

            // Charger et retourner le certificat depuis le fichier PFX avec mot de passe
            #pragma warning disable SYSLIB0057
            return new X509Certificate2(certPath, "OphtalmoPro2024!");
            #pragma warning restore SYSLIB0057
        }

        private static X509Extension? CreateSubjectAlternativeNameExtension()
        {
            try
            {
                var sanBuilder = new SubjectAlternativeNameBuilder();
                sanBuilder.AddDnsName("localhost");
                sanBuilder.AddIpAddress(IPAddress.Loopback);
                sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);

                return sanBuilder.Build();
            }
            catch
            {
                return null;
            }
        }
    }
}
