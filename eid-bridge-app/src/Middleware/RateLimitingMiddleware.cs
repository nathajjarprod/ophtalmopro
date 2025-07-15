using System.Collections.Concurrent;

namespace OphtalmoPro.EidBridge.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly IConfiguration _configuration;
        private readonly ConcurrentDictionary<string, ClientRequestInfo> _clients = new();
        private readonly Timer _cleanupTimer;

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
            
            // Nettoyer les anciennes entrées toutes les minutes
            _cleanupTimer = new Timer(CleanupOldEntries!, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var maxRequestsPerMinute = _configuration.GetValue<int>("EidBridge:Security:MaxRequestsPerMinute", 60);
            
            var clientInfo = _clients.GetOrAdd(clientIp, _ => new ClientRequestInfo());
            
            lock (clientInfo)
            {
                var now = DateTime.UtcNow;
                
                // Nettoyer les requêtes anciennes (plus d'une minute)
                clientInfo.RequestTimes.RemoveAll(time => now - time > TimeSpan.FromMinutes(1));
                
                // Vérifier la limite
                if (clientInfo.RequestTimes.Count >= maxRequestsPerMinute)
                {
                    _logger.LogWarning("Rate limit dépassé pour {ClientIp}: {RequestCount} requêtes",
                        clientIp, clientInfo.RequestTimes.Count);
                    
                    context.Response.StatusCode = 429; // Too Many Requests
                    context.Response.Headers.Append("Retry-After", "60");
                    return;
                }
                
                // Ajouter cette requête
                clientInfo.RequestTimes.Add(now);
            }

            await _next(context);
        }

        private void CleanupOldEntries(object? state)
        {
            var cutoff = DateTime.UtcNow.AddMinutes(-5);
            var keysToRemove = new List<string>();

            foreach (var kvp in _clients)
            {
                lock (kvp.Value)
                {
                    kvp.Value.RequestTimes.RemoveAll(time => DateTime.UtcNow - time > TimeSpan.FromMinutes(1));
                    
                    if (!kvp.Value.RequestTimes.Any())
                    {
                        keysToRemove.Add(kvp.Key);
                    }
                }
            }

            foreach (var key in keysToRemove)
            {
                _clients.TryRemove(key, out _);
            }
        }

        private class ClientRequestInfo
        {
            public List<DateTime> RequestTimes { get; } = new();
        }
    }
}