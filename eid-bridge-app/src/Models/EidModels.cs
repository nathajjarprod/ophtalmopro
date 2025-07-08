using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OphtalmoPro.EidBridge.Models
{
    // Modèles de requête
    public class EidReadRequest
    {
        public bool IncludePhoto { get; set; } = false;
        public bool IncludeAddress { get; set; } = true;
        public int? Timeout { get; set; } = 30000; // 30 secondes par défaut
    }

    public class TokenRequest
    {
        [Required]
        public string ApplicationId { get; set; } = string.Empty;
    }

    // Modèles de réponse
    public class EidReadResponse
    {
        public bool Success { get; set; }
        public EidData? Data { get; set; }
        public string? Error { get; set; }
        public string? ErrorCode { get; set; }
        public string? RequestId { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class ServiceStatusResponse
    {
        public string Status { get; set; } = string.Empty;
        public string Middleware { get; set; } = string.Empty;
        public int Readers { get; set; }
        public int ReadersWithCard { get; set; }
        public DateTime? LastRead { get; set; }
        public string Version { get; set; } = string.Empty;
        public TimeSpan Uptime { get; set; }
    }

    public class ReadersResponse
    {
        public bool Success { get; set; }
        public List<ReaderInfo> Readers { get; set; } = new();
        public DateTime Timestamp { get; set; }
    }

    public class TokenResponse
    {
        public string Token { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
        public string TokenType { get; set; } = string.Empty;
    }

    public class DiagnosticResponse
    {
        public DateTime Timestamp { get; set; }
        public string ServiceVersion { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public string DotNetVersion { get; set; } = string.Empty;
        public MiddlewareDiagnostic Middleware { get; set; } = new();
        public List<ReaderDiagnostic> Readers { get; set; } = new();
        public MemoryInfo Memory { get; set; } = new();
        public TimeSpan Uptime { get; set; }
    }

    // Modèles de données eID
    public class EidData
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public string PlaceOfBirth { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Niss { get; set; } = string.Empty;
        public string CardNumber { get; set; } = string.Empty;
        public string ValidityBeginDate { get; set; } = string.Empty;
        public string ValidityEndDate { get; set; } = string.Empty;
        public EidAddress Address { get; set; } = new();
        public string? Photo { get; set; }
    }

    public class EidAddress
    {
        public string Street { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    // Modèles de lecteurs
    public class ReaderInfo
    {
        public string Name { get; set; } = string.Empty;
        public bool HasCard { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? LastActivity { get; set; }
    }

    public class CardReader
    {
        public string Name { get; set; } = string.Empty;
        public bool HasCard { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? LastActivity { get; set; }
        public string Driver { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
    }

    // Modèles de diagnostic
    public class MiddlewareDiagnostic
    {
        public bool IsAvailable { get; set; }
        public string? WorkingPort { get; set; }
        public List<string> TestedPorts { get; set; } = new();
        public string? Version { get; set; }
        public string? ServiceName { get; set; }
        public string? LastError { get; set; }
    }

    public class ReaderDiagnostic
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Driver { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
        public DateTime LastCheck { get; set; }
        public string? LastError { get; set; }
    }

    public class MemoryInfo
    {
        public long WorkingSet { get; set; }
        public long GcMemory { get; set; }
    }

    // Modèles de configuration
    public class EidReadOptions
    {
        public bool IncludePhoto { get; set; } = false;
        public bool IncludeAddress { get; set; } = true;
        public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(30);
    }

    // Modèles d'audit
    public class CardReadAudit
    {
        public string RequestId { get; set; } = string.Empty;
        public string ClientIp { get; set; } = string.Empty;
        public string ReaderName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public object? DataRead { get; set; }
        public string? Error { get; set; }
        public DateTime Timestamp { get; set; }
    }

    // Codes d'erreur standardisés
    public static class ErrorCodes
    {
        public const string NO_CARD_DETECTED = "NO_CARD_DETECTED";
        public const string CARD_NOT_PRESENT = "CARD_NOT_PRESENT";
        public const string READ_TIMEOUT = "READ_TIMEOUT";
        public const string MIDDLEWARE_ERROR = "MIDDLEWARE_ERROR";
        public const string INTERNAL_ERROR = "INTERNAL_ERROR";
        public const string UNAUTHORIZED = "UNAUTHORIZED";
        public const string INVALID_REQUEST = "INVALID_REQUEST";
    }
}