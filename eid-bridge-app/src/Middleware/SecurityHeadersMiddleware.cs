using System.Security.Cryptography;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace OphtalmoPro.EidBridge.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // 🔐 Génère un nonce aléatoire
            var nonceBytes = RandomNumberGenerator.GetBytes(16);
            var nonce = Convert.ToBase64String(nonceBytes);

            // 💾 Stocke le nonce dans le contexte pour y accéder dans Startup.cs
            context.Items["CSPNonce"] = nonce;

            // 📋 En-têtes de sécurité
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["X-Frame-Options"] = "DENY";
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // ✅ CSP avec nonce
            context.Response.Headers["Content-Security-Policy"] =
                $"default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'nonce-{nonce}';";

            // Masquer infos serveur
            context.Response.Headers.Remove("Server");
            context.Response.Headers.Remove("X-Powered-By");

            await _next(context);
        }
    }
}
