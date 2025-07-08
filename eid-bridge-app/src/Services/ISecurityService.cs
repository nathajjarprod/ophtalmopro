using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace OphtalmoPro.EidBridge.Services
{
    public interface ISecurityService
    {
        bool IsAuthorizedClient(string clientIp);
        string GenerateTemporaryToken(string clientIp, string applicationId);
        bool ValidateToken(string token);
        ClaimsPrincipal GetTokenClaims(string token);
    }

    public class SecurityService : ISecurityService
    {
        private readonly ILogger<SecurityService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _secretKey;
        private readonly List<string> _authorizedOrigins;

        public SecurityService(ILogger<SecurityService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _secretKey = GenerateSecretKey();
            _authorizedOrigins = _configuration.GetSection("EidBridge:Security:AllowedOrigins").Get<List<string>>() ?? new List<string>();
        }

        public bool IsAuthorizedClient(string clientIp)
        {
            try
            {
                // Autoriser localhost et 127.0.0.1
                var authorizedIps = new[] { "127.0.0.1", "::1", "localhost" };
                
                if (string.IsNullOrEmpty(clientIp))
                {
                    _logger.LogWarning("IP client vide ou nulle");
                    return false;
                }

                var isAuthorized = authorizedIps.Any(ip => 
                    clientIp.Equals(ip, StringComparison.OrdinalIgnoreCase) ||
                    clientIp.StartsWith("127.0.0.1") ||
                    clientIp.StartsWith("::1")
                );

                if (!isAuthorized)
                {
                    _logger.LogWarning("Tentative d'accès non autorisée depuis {ClientIp}", clientIp);
                }

                return isAuthorized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification d'autorisation pour {ClientIp}", clientIp);
                return false;
            }
        }

        public string GenerateTemporaryToken(string clientIp, string applicationId)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_secretKey);
                
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim("client_ip", clientIp),
                        new Claim("application_id", applicationId),
                        new Claim("issued_at", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
                    }),
                    Expires = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("EidBridge:Security:TokenExpirationMinutes", 5)),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = "OphtalmoPro-eID-Bridge",
                    Audience = applicationId
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                _logger.LogInformation("Token généré pour {ApplicationId} depuis {ClientIp}", applicationId, clientIp);
                
                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du token");
                throw new SecurityException("Impossible de générer le token de sécurité");
            }
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_secretKey);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = "OphtalmoPro-eID-Bridge",
                    ValidateAudience = false, // Flexible sur l'audience
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Token invalide");
                return false;
            }
        }

        public ClaimsPrincipal GetTokenClaims(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_secretKey);

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = "OphtalmoPro-eID-Bridge",
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'extraction des claims du token");
                throw new SecurityException("Token invalide");
            }
        }

        private string GenerateSecretKey()
        {
            // Générer une clé secrète aléatoire pour cette instance
            var key = new byte[32];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(key);
            }
            return Convert.ToBase64String(key);
        }
    }
}