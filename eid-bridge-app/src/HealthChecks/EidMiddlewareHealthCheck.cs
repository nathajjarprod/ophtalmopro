using Microsoft.Extensions.Diagnostics.HealthChecks;
using OphtalmoPro.EidBridge.Services;

namespace OphtalmoPro.EidBridge.HealthChecks
{
    public class EidMiddlewareHealthCheck : IHealthCheck
    {
        private readonly IEidMiddlewareService _middlewareService;
        private readonly ILogger<EidMiddlewareHealthCheck> _logger;

        public EidMiddlewareHealthCheck(IEidMiddlewareService middlewareService, ILogger<EidMiddlewareHealthCheck> logger)
        {
            _middlewareService = middlewareService;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var isAvailable = await _middlewareService.IsAvailableAsync();
                
                if (isAvailable)
                {
                    var version = await _middlewareService.GetVersionAsync();
                    return HealthCheckResult.Healthy($"Middleware eID disponible (version: {version})");
                }
                else
                {
                    return HealthCheckResult.Unhealthy("Middleware eID non disponible");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du health check du middleware eID");
                return HealthCheckResult.Unhealthy("Erreur lors de la vérification du middleware eID", ex);
            }
        }
    }
}