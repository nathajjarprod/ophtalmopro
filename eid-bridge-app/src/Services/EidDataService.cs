using Microsoft.Extensions.Logging;
using OphtalmoPro.EidBridge.Models;
using Swelio.Engine;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Drawing;
using System.IO;

namespace OphtalmoPro.EidBridge.Services
{
    public interface IEidDataService
    {
        Task<EidData> ReadCardDataAsync(EidReadOptions options);
        Task<bool> CheckMiddlewareStatusAsync();
        Task<MiddlewareDiagnostic> GetMiddlewareDiagnosticAsync();
    }

    public class EidDataService : IEidDataService, IDisposable
    {
        private readonly ILogger<EidDataService> _logger;
        private readonly Manager _engine;

        public EidDataService(ILogger<EidDataService> logger)
        {
            _logger = logger;
            _engine = new Manager();
            _engine.Active = true;  // démarre le moteur Swelio
        }

        public void Dispose()
        {
            if (_engine != null)
            {
                _engine.Active = false;
                _engine.Dispose();
            }
        }

        public Task<bool> CheckMiddlewareStatusAsync()
        {
            // Swelio ne nécessite pas de middleware externe
            return Task.FromResult(true);
        }

        public Task<MiddlewareDiagnostic> GetMiddlewareDiagnosticAsync()
        {
            return Task.FromResult(new MiddlewareDiagnostic
            {
                IsAvailable = true,
                WorkingPort = "N/A (Swelio SDK)",
                TestedPorts = new List<string> { "Swelio" },
                ServiceName = "Swelio.Engine"
            });
        }

        public async Task<EidData> ReadCardDataAsync(EidReadOptions options)
        {
            _logger.LogInformation("📇 Lecture eID via Swelio...");

            return await Task.Run(() =>
            {
                try
                {
                   Swelio.Engine.CardReader reader = _engine.GetReader();
if (reader == null)
    throw new CardNotPresentException("Aucun lecteur de carte disponible");

var card = reader.GetCard(true);
if (card == null)
    throw new CardNotPresentException("Aucune carte eID insérée");

using (card)
{
    var identity = card.ReadIdentity();
    var address = card.ReadAddress();

    if (identity == null)
        throw new MiddlewareException("Impossible de lire les données d'identité");


                    var eidData = new EidData
                    {
                        FirstName = identity.FirstName1 + " " + identity.FirstName2,
                        LastName = identity.Surname,
                        DateOfBirth = FormatDate(identity.BirthDate),
                        PlaceOfBirth = identity.BirthLocation,
                        Nationality = identity.Nationality,
                        Niss = FormatNiss(identity.NationalNumber),
                        CardNumber = identity.CardNumber,
                        ValidityBeginDate = FormatDate(identity.ValidityDateBegin),
                        ValidityEndDate = FormatDate(identity.ValidityDateEnd),
                        Address = new EidAddress(),
                        Photo = null
                    };

                    if (options.IncludeAddress && address != null)
                    {
                        eidData.Address = new EidAddress
                        {
                            Street = address.Street ?? "",
                            PostalCode = address.Zip ?? "",
                            City = address.Municipality ?? "",
                            Country = "Belgique"
                        };
                    }

                    if (options.IncludePhoto)
                    {
                        try
                        {
                            var photo = card.ReadPhoto();
                            eidData.Photo = photo != null ? ConvertImageToBase64(photo) : null;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "❗ Photo non disponible");
                        }
                    }

                    _logger.LogInformation("✅ Données eID lues avec succès");
                    return eidData;
                }
                }
                catch (CardNotPresentException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Erreur de lecture carte eID");
                    throw new MiddlewareException("Erreur de lecture carte", ex);
                }
            });
        }

        private string FormatDate(DateTime date)
        {
            return date == DateTime.MinValue ? "" : date.ToString("dd/MM/yyyy");
        }

        private string FormatNiss(string niss)
        {
            if (string.IsNullOrWhiteSpace(niss)) return "";

            var digits = System.Text.RegularExpressions.Regex.Replace(niss, @"\D", "");
            if (digits.Length == 11)
                return $"{digits.Substring(0, 2)}.{digits.Substring(2, 2)}.{digits.Substring(4, 2)}-{digits.Substring(6, 3)}.{digits.Substring(9, 2)}";

            return niss;
        }

        [System.Runtime.Versioning.SupportedOSPlatform("windows")]
        private string ConvertImageToBase64(Image photo)
        {
            if (photo == null)
                return null;

            using var ms = new MemoryStream();
            photo.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg);
            return Convert.ToBase64String(ms.ToArray());
        }
    }

    // Exceptions personnalisées
    public class MiddlewareException : Exception
    {
        public MiddlewareException(string message) : base(message) { }
        public MiddlewareException(string message, Exception inner) : base(message, inner) { }
    }

    public class CardNotPresentException : Exception
    {
        public CardNotPresentException(string message) : base(message) { }
    }
}
