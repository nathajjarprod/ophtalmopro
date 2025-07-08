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
        public required string ApplicationId { get; set; }
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
        public required string Status { get; set; }
        public required string Middleware { get; set; }
        public int Readers { get; set; }
        public int ReadersWithCard { get; set; }
        public DateTime? LastRead { get; set; }
        public required string Version { get; set; }
        public TimeSpan Uptime { get; set; }
    }

    public class ReadersResponse
    {
        public bool Success { get; set; }
        public required List<ReaderInfo> Readers { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class TokenResponse
    {
        public required string Token { get; set; }
        public int ExpiresIn { get; set; }
        public required string TokenType { get; set; }
    }

    public class DiagnosticResponse
    {
        public DateTime Timestamp { get; set; }
        public required string ServiceVersion { get; set; }
        public required string OperatingSystem { get; set; }
        public required string DotNetVersion { get; set; }
        public required MiddlewareDiagnostic Middleware { get; set; }
        public required List<ReaderDiagnostic> Readers { get; set; }
        public required MemoryInfo Memory { get; set; }
        public TimeSpan Uptime { get; set; }
    }

    // Modèles de données eID
    public class EidData
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string DateOfBirth { get; set; }
        public required string PlaceOfBirth { get; set; }
        public required string Nationality { get; set; }
        public required string Niss { get; set; }
        public required string CardNumber { get; set; }
        public required string ValidityBeginDate { get; set; }
        public required string ValidityEndDate { get; set; }
        public required EidAddress Address { get; set; }
        public string? Photo { get; set; }
    }

    public class EidAddress
    {
        public required string Street { get; set; }
        public required string PostalCode { get; set; }
        public required string City { get; set; }
        public required string Country { get; set; }
    }

    // Modèles de lecteurs
    public class ReaderInfo
    {
        public required string Name { get; set; }
        public bool HasCard { get; set; }
        public required string Status { get; set; }
        public DateTime? LastActivity { get; set; }
    }

    public class CardReader
    {
        public required string Name { get; set; }
        public bool HasCard { get; set; }
        public required string Status { get; set; }
        public DateTime? LastActivity { get; set; }
        public required string Driver { get; set; }
        public bool IsConnected { get; set; }
    }

    // Modèles de diagnostic
    public class MiddlewareDiagnostic
    {
        public bool IsAvailable { get; set; }
        public string? WorkingPort { get; set; }
        public required List<string> TestedPorts { get; set; }
        public string? Version { get; set; }
        public string? ServiceName { get; set; }
        public string? LastError { get; set; }
    }

    public class ReaderDiagnostic
    {
        public required string Name { get; set; }
        public required string Status { get; set; }
        public required string Driver { get; set; }
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
        public required string RequestId { get; set; }
        public required string ClientIp { get; set; }
        public required string ReaderName { get; set; }
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