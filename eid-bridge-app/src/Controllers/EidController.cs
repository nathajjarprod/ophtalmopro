using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using OphtalmoPro.EidBridge.Models;
using OphtalmoPro.EidBridge.Services;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace OphtalmoPro.EidBridge.Controllers
{
    [ApiController]
    [Route("api")]
    public class EidController : ControllerBase
    {
        private readonly ILogger<EidController> _logger;
        private readonly IEidDataService _eidDataService;
        private readonly ICardReaderService _cardReaderService;
        private readonly ISecurityService _securityService;
        private readonly IAuditService _auditService;

        public EidController(
            ILogger<EidController> logger,
            IEidDataService eidDataService,
            ICardReaderService cardReaderService,
            ISecurityService securityService,
            IAuditService auditService)
        {
            _logger = logger;
            _eidDataService = eidDataService;
            _cardReaderService = cardReaderService;
            _securityService = securityService;
            _auditService = auditService;
        }

        /// <summary>
        /// Obtient le statut du service eID Bridge
        /// </summary>
        [HttpGet("status")]
        public async Task<ActionResult<ServiceStatusResponse>> GetStatus()
        {
            try
            {
                var readers = await _cardReaderService.GetAvailableReadersAsync();
                var middlewareStatus = await _eidDataService.CheckMiddlewareStatusAsync();

                var status = new ServiceStatusResponse
                {
                    Status = "ready",
                    Middleware = middlewareStatus ? "available" : "unavailable",
                    Readers = readers.Count,
                    ReadersWithCard = readers.Count(r => r.HasCard),
                    LastRead = _auditService.GetLastReadTime(),
                    Version = "1.0.0",
                    Uptime = DateTime.Now - Process.GetCurrentProcess().StartTime
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du statut");
                return StatusCode(500, new { error = "Erreur interne du service" });
            }
        }

        /// <summary>
        /// Lit les données d'une carte eID
        /// </summary>
        [HttpPost("read-card")]
        public async Task<ActionResult<EidReadResponse>> ReadCard([FromBody] EidReadRequest request)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var requestId = Guid.NewGuid().ToString();

            try
            {
                _logger.LogInformation("Début lecture carte eID - Request ID: {RequestId}, Client: {ClientIp}", 
                    requestId, clientIp);

                // Validation de sécurité
                if (!_securityService.IsAuthorizedClient(clientIp))
                {
                    _logger.LogWarning("Tentative d'accès non autorisée depuis {ClientIp}", clientIp);
                    return Unauthorized(new { error = "Accès non autorisé" });
                }

                // Validation des paramètres
                if (request == null)
                {
                    return BadRequest(new { error = "Paramètres de requête manquants" });
                }

                // Vérifier la disponibilité des lecteurs
                var readers = await _cardReaderService.GetAvailableReadersAsync();
                var readerWithCard = readers.FirstOrDefault(r => r.HasCard);

                if (readerWithCard == null)
                {
                    _logger.LogWarning("Aucune carte eID détectée dans les lecteurs disponibles");
                    return BadRequest(new EidReadResponse
                    {
                        Success = false,
                        Error = "Aucune carte eID détectée. Veuillez insérer votre carte et réessayer.",
                        ErrorCode = "NO_CARD_DETECTED",
                        Timestamp = DateTime.UtcNow
                    });
                }

                // Lecture des données eID
                _logger.LogInformation("Lecture des données eID sur le lecteur: {ReaderName}", readerWithCard.Name);
                
                var eidData = await _eidDataService.ReadCardDataAsync(new EidReadOptions
                {
                    IncludePhoto = request.IncludePhoto,
                    IncludeAddress = request.IncludeAddress,
                    Timeout = TimeSpan.FromMilliseconds(request.Timeout ?? 30000)
                });

                // Audit de la lecture
                await _auditService.LogCardReadAsync(new CardReadAudit
                {
                    RequestId = requestId,
                    ClientIp = clientIp,
                    ReaderName = readerWithCard.Name,
                    Success = true,
                    DataRead = new
                    {
                        HasIdentity = !string.IsNullOrEmpty(eidData.FirstName),
                        HasAddress = eidData.Address != null,
                        HasPhoto = !string.IsNullOrEmpty(eidData.Photo)
                    },
                    Timestamp = DateTime.UtcNow
                });

                _logger.LogInformation("Lecture carte eID réussie - Request ID: {RequestId}, Patient: {PatientName}", 
                    requestId, $"{eidData.FirstName} {eidData.LastName}");

                return Ok(new EidReadResponse
                {
                    Success = true,
                    Data = eidData,
                    RequestId = requestId,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (TimeoutException ex)
            {
                _logger.LogWarning(ex, "Timeout lors de la lecture carte eID - Request ID: {RequestId}", requestId);
                
                await _auditService.LogCardReadAsync(new CardReadAudit
                {
                    RequestId = requestId,
                    ClientIp = clientIp,
                    Success = false,
                    Error = "Timeout",
                    Timestamp = DateTime.UtcNow
                });

                return BadRequest(new EidReadResponse
                {
                    Success = false,
                    Error = "Timeout lors de la lecture de la carte. Veuillez vérifier que la carte est bien insérée.",
                    ErrorCode = "READ_TIMEOUT",
                    RequestId = requestId,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (CardNotPresentException ex)
            {
                _logger.LogWarning(ex, "Carte non présente - Request ID: {RequestId}", requestId);
                
                return BadRequest(new EidReadResponse
                {
                    Success = false,
                    Error = "Carte eID non détectée. Veuillez insérer votre carte dans le lecteur.",
                    ErrorCode = "CARD_NOT_PRESENT",
                    RequestId = requestId,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (MiddlewareException ex)
            {
                _logger.LogError(ex, "Erreur middleware eID - Request ID: {RequestId}", requestId);
                
                return StatusCode(503, new EidReadResponse
                {
                    Success = false,
                    Error = "Service de lecture eID temporairement indisponible. Veuillez réessayer.",
                    ErrorCode = "MIDDLEWARE_ERROR",
                    RequestId = requestId,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur inattendue lors de la lecture carte eID - Request ID: {RequestId}", requestId);
                
                await _auditService.LogCardReadAsync(new CardReadAudit
                {
                    RequestId = requestId,
                    ClientIp = clientIp,
                    Success = false,
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                });

                return StatusCode(500, new EidReadResponse
                {
                    Success = false,
                    Error = "Erreur interne lors de la lecture de la carte. Veuillez contacter le support.",
                    ErrorCode = "INTERNAL_ERROR",
                    RequestId = requestId,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Obtient la liste des lecteurs de cartes disponibles
        /// </summary>
        [HttpGet("readers")]
        public async Task<ActionResult<ReadersResponse>> GetReaders()
        {
            try
            {
                var readers = await _cardReaderService.GetAvailableReadersAsync();
                
                return Ok(new ReadersResponse
                {
                    Success = true,
                    Readers = readers.Select(r => new ReaderInfo
                    {
                        Name = r.Name,
                        HasCard = r.HasCard,
                        Status = r.Status,
                        LastActivity = r.LastActivity
                    }).ToList(),
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des lecteurs");
                return StatusCode(500, new { error = "Erreur lors de la récupération des lecteurs" });
            }
        }

        /// <summary>
        /// Génère un token d'authentification temporaire
        /// </summary>
        [HttpPost("auth/token")]
        public ActionResult<TokenResponse> GenerateToken([FromBody] TokenRequest request)
        {
            try
            {
                var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                
                if (!_securityService.IsAuthorizedClient(clientIp))
                {
                    return Unauthorized(new { error = "Accès non autorisé" });
                }

                var token = _securityService.GenerateTemporaryToken(clientIp, request.ApplicationId);
                
                return Ok(new TokenResponse
                {
                    Token = token,
                    ExpiresIn = 300, // 5 minutes
                    TokenType = "Bearer"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du token");
                return StatusCode(500, new { error = "Erreur lors de la génération du token" });
            }
        }

        /// <summary>
        /// Endpoint de diagnostic pour les tests
        /// </summary>
        [HttpGet("diagnostic")]
        public async Task<ActionResult<DiagnosticResponse>> GetDiagnostic()
        {
            try
            {
                var diagnostic = new DiagnosticResponse
                {
                    Timestamp = DateTime.UtcNow,
                    ServiceVersion = "1.0.0",
                    OperatingSystem = Environment.OSVersion.ToString(),
                    DotNetVersion = Environment.Version.ToString(),
                    Middleware = await _eidDataService.GetMiddlewareDiagnosticAsync(),
                    Readers = await _cardReaderService.GetReaderDiagnosticAsync(),
                    Memory = new MemoryInfo
                    {
                        WorkingSet = Environment.WorkingSet,
                        GcMemory = GC.GetTotalMemory(false)
                    },
                    Uptime = DateTime.Now - Process.GetCurrentProcess().StartTime
                };

                return Ok(diagnostic);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du diagnostic");
                return StatusCode(500, new { error = "Erreur lors du diagnostic" });
            }
        }
    }
}