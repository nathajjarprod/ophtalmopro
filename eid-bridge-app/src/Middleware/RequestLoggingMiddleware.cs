using System.Diagnostics;

namespace OphtalmoPro.EidBridge.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestId = Guid.NewGuid().ToString("N")[..8];
            
            // Ajouter l'ID de requête aux headers de réponse
            context.Response.Headers.Add("X-Request-ID", requestId);
            
            var clientIp = context.Connection.RemoteIpAddress?.ToString();
            var userAgent = context.Request.Headers["User-Agent"].ToString();
            
            _logger.LogInformation("Début requête {RequestId} - {Method} {Path} depuis {ClientIp}",
                requestId, context.Request.Method, context.Request.Path, clientIp);

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur requête {RequestId} - {Method} {Path}",
                    requestId, context.Request.Method, context.Request.Path);
                throw;
            }
            finally
            {
                stopwatch.Stop();
                
                _logger.LogInformation("Fin requête {RequestId} - {StatusCode} en {ElapsedMs}ms",
                    requestId, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
            }
        }
    }
}