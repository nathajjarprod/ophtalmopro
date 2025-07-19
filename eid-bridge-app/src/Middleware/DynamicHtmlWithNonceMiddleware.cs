using System.Text;
using Microsoft.AspNetCore.Http;

namespace OphtalmoPro.EidBridge.Middleware
{
    public class DynamicHtmlWithNonceMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;

        public DynamicHtmlWithNonceMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.Equals("/eid-test-swelio.html", StringComparison.OrdinalIgnoreCase))
            {
                var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", "eid-test-swelio.html");
                if (!File.Exists(filePath))
                {
                    context.Response.StatusCode = 404;
                    await context.Response.WriteAsync("Fichier non trouvé");
                    return;
                }

                // Génère le nonce
                var nonce = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
                context.Items["CSPNonce"] = nonce;

                var html = await File.ReadAllTextAsync(filePath);

                // Injecte le nonce dans <script> et <style>
                html = html.Replace("<script", $"<script nonce=\"{nonce}\"");
                html = html.Replace("<style", $"<style nonce=\"{nonce}\"");

                // Ajoute la bonne politique CSP
                context.Response.Headers["Content-Security-Policy"] =
                    $"default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'nonce-{nonce}';";

                context.Response.ContentType = "text/html; charset=utf-8";
                await context.Response.WriteAsync(html, Encoding.UTF8);
            }
            else
            {
                await _next(context);
            }
        }
    }
}
