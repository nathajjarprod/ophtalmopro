using OphtalmoPro.EidBridge.Models;

namespace OphtalmoPro.EidBridge.Services
{
    public interface IAuditService
    {
        Task LogCardReadAsync(CardReadAudit audit);
        Task LogSecurityEventAsync(string eventType, string details, string clientIp = null);
        Task LogSystemEventAsync(string eventType, string details);
        DateTime? GetLastReadTime();
        Task<List<CardReadAudit>> GetRecentReadsAsync(int count = 10);
        Task CleanupOldLogsAsync();
    }

    public class AuditService : IAuditService
    {
        private readonly ILogger<AuditService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _logPath;
        private readonly List<CardReadAudit> _recentReads = new();
        private readonly object _lockObject = new();

        public AuditService(ILogger<AuditService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _logPath = _configuration.GetValue<string>("EidBridge:Audit:LogPath") ?? 
                      Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), 
                                   "OphtalmoPro", "eID-Bridge", "Logs");
            
            EnsureLogDirectoryExists();
        }

        public async Task LogCardReadAsync(CardReadAudit audit)
        {
            try
            {
                lock (_lockObject)
                {
                    _recentReads.Add(audit);
                    
                    // Garder seulement les 100 dernières lectures en mémoire
                    if (_recentReads.Count > 100)
                    {
                        _recentReads.RemoveAt(0);
                    }
                }

                // Log structuré
                _logger.LogInformation("Lecture carte eID - RequestId: {RequestId}, Client: {ClientIp}, Success: {Success}, Reader: {ReaderName}",
                    audit.RequestId, audit.ClientIp, audit.Success, audit.ReaderName);

                // Écriture dans le fichier d'audit
                var logEntry = new
                {
                    Timestamp = audit.Timestamp,
                    Type = "CardRead",
                    RequestId = audit.RequestId,
                    ClientIp = audit.ClientIp,
                    ReaderName = audit.ReaderName,
                    Success = audit.Success,
                    DataRead = audit.DataRead,
                    Error = audit.Error
                };

                await WriteAuditLogAsync("card-reads", logEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'audit de lecture de carte");
            }
        }

        public async Task LogSecurityEventAsync(string eventType, string details, string clientIp = null)
        {
            try
            {
                _logger.LogWarning("Événement sécurité - Type: {EventType}, Client: {ClientIp}, Détails: {Details}",
                    eventType, clientIp ?? "unknown", details);

                var logEntry = new
                {
                    Timestamp = DateTime.UtcNow,
                    Type = "Security",
                    EventType = eventType,
                    ClientIp = clientIp,
                    Details = details
                };

                await WriteAuditLogAsync("security", logEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'audit de sécurité");
            }
        }

        public async Task LogSystemEventAsync(string eventType, string details)
        {
            try
            {
                _logger.LogInformation("Événement système - Type: {EventType}, Détails: {Details}",
                    eventType, details);

                var logEntry = new
                {
                    Timestamp = DateTime.UtcNow,
                    Type = "System",
                    EventType = eventType,
                    Details = details
                };

                await WriteAuditLogAsync("system", logEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'audit système");
            }
        }

        public DateTime? GetLastReadTime()
        {
            lock (_lockObject)
            {
                return _recentReads.LastOrDefault(r => r.Success)?.Timestamp;
            }
        }

        public async Task<List<CardReadAudit>> GetRecentReadsAsync(int count = 10)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _recentReads.TakeLast(count).ToList();
            }
        }

        public async Task CleanupOldLogsAsync()
        {
            try
            {
                var retentionDays = _configuration.GetValue<int>("EidBridge:Audit:LogRetentionDays", 30);
                var cutoffDate = DateTime.Now.AddDays(-retentionDays);

                var logFiles = Directory.GetFiles(_logPath, "*.log")
                    .Where(file => File.GetCreationTime(file) < cutoffDate);

                foreach (var file in logFiles)
                {
                    try
                    {
                        File.Delete(file);
                        _logger.LogInformation("Fichier de log supprimé: {FileName}", Path.GetFileName(file));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Impossible de supprimer le fichier de log: {FileName}", file);
                    }
                }

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du nettoyage des logs");
            }
        }

        private void EnsureLogDirectoryExists()
        {
            try
            {
                if (!Directory.Exists(_logPath))
                {
                    Directory.CreateDirectory(_logPath);
                    _logger.LogInformation("Répertoire de logs créé: {LogPath}", _logPath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Impossible de créer le répertoire de logs: {LogPath}", _logPath);
            }
        }

        private async Task WriteAuditLogAsync(string category, object logEntry)
        {
            try
            {
                var fileName = $"{category}-{DateTime.Now:yyyy-MM-dd}.log";
                var filePath = Path.Combine(_logPath, fileName);
                
                var logLine = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} | {System.Text.Json.JsonSerializer.Serialize(logEntry)}\n";
                
                await File.AppendAllTextAsync(filePath, logLine);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'écriture du log d'audit");
            }
        }
    }
}