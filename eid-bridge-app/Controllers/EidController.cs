using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EidBridge.Controllers
{
    [ApiController]
    [Route("api")]
    public class EidController : ControllerBase
    {
        private readonly EidService _eidService;
        private readonly ILogger<EidController> _logger;

        public EidController(EidService eidService, ILogger<EidController> logger)
        {
            _eidService = eidService;
            _logger = logger;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var isAvailable = await _eidService.IsMiddlewareAvailable();
                
                return Ok(new
                {
                    status = isAvailable ? "ready" : "error",
                    middleware = isAvailable ? "available" : "unavailable",
                    version = "1.0.0",
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification du statut");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("readers")]
        public async Task<IActionResult> GetReaders()
        {
            try
            {
                var readers = await _eidService.GetReaders();
                return Ok(new { success = true, readers });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des lecteurs");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("read-card")]
        [HttpPost("read-card")]
        public async Task<IActionResult> ReadCard([FromQuery] bool includePhoto = false, [FromQuery] bool includeAddress = true)
        {
            try
            {
                _logger.LogInformation("Début de lecture de carte eID");
                var cardData = await _eidService.ReadCard(includePhoto, includeAddress);
                _logger.LogInformation("Lecture de carte réussie");
                
                return Ok(new
                {
                    success = true,
                    data = cardData,
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la lecture de la carte");
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    timestamp = DateTime.Now
                });
            }
        }
    }
}