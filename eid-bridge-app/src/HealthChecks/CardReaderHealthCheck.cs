using Microsoft.Extensions.Diagnostics.HealthChecks;
using OphtalmoPro.EidBridge.Services;

namespace OphtalmoPro.EidBridge.HealthChecks
{
    public class CardReaderHealthCheck : IHealthCheck
    {
        private readonly ICardReaderService _cardReaderService;
        private readonly ILogger<CardReaderHealthCheck> _logger;

        public CardReaderHealthCheck(ICardReaderService cardReaderService, ILogger<CardReaderHealthCheck> logger)
        {
            _cardReaderService = cardReaderService;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var readers = await _cardReaderService.GetAvailableReadersAsync();
                var readersWithCard = readers.Count(r => r.HasCard);
                
                if (readers.Any())
                {
                    return HealthCheckResult.Healthy($"{readers.Count} lecteur(s) détecté(s), {readersWithCard} avec carte");
                }
                else
                {
                    return HealthCheckResult.Degraded("Aucun lecteur de cartes détecté");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du health check des lecteurs de cartes");
                return HealthCheckResult.Unhealthy("Erreur lors de la vérification des lecteurs", ex);
            }
        }
    }
}