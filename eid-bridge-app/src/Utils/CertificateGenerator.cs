using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Net;

namespace OphtalmoPro.EidBridge.Utils
{
    public static class CertificateGenerator
    {
        public static X509Certificate2 CreateSelfSignedCertificate(string certPath)
        {
            using var rsa = RSA.Create(2048);
            
            var request = new CertificateRequest(
                "CN=OphtalmoPro eID Bridge",
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

            var sanBuilder = new SubjectAlternativeNameBuilder();
            sanBuilder.AddDnsName("localhost");
            sanBuilder.AddIpAddress(IPAddress.Loopback);
            sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
            
            request.CertificateExtensions.Add(
                new X509SubjectAlternativeNameExtension(sanBuilder.Build(), critical: false)
            );

            // Créer le certificat auto-signé
            var certificate = request.CreateSelfSigned(
                DateTimeOffset.Now.AddDays(-1),
                DateTimeOffset.Now.AddYears(5)
            );

            // Exporter avec clé privée
            var pfxBytes = certificate.Export(X509ContentType.Pfx, "OphtalmoPro2024!");
            File.WriteAllBytes(certPath, pfxBytes);

            return new X509Certificate2(certPath, "OphtalmoPro2024!", X509KeyStorageFlags.PersistKeySet);
        }
    }
}