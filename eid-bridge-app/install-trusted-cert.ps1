# Script PowerShell pour installer le certificat eID Bridge dans le magasin de certificats Windows
# Exécuter en tant qu'administrateur pour une installation système complète

# Définir les chemins
$certDir = "C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates"
$certFile = Join-Path $certDir "bridge-cert.pfx"
$password = "OphtalmoPro2024!"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation du certificat eID Bridge" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le certificat existe
if (-not (Test-Path $certFile)) {
    Write-Host "❌ Certificat non trouvé: $certFile" -ForegroundColor Red
    Write-Host "Vérifiez que l'application eID Bridge a été démarrée au moins une fois."
    exit 1
}

try {
    # Charger le certificat
    Write-Host "Chargement du certificat..." -ForegroundColor Yellow
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certFile, $password)
    
    Write-Host "✅ Certificat chargé avec succès" -ForegroundColor Green
    Write-Host "   Sujet: $($cert.Subject)" -ForegroundColor Gray
    Write-Host "   Émetteur: $($cert.Issuer)" -ForegroundColor Gray
    Write-Host "   Valide jusqu'au: $($cert.NotAfter)" -ForegroundColor Gray
    Write-Host "   Empreinte: $($cert.Thumbprint)" -ForegroundColor Gray
    
    # Installer dans le magasin des autorités de certification racine de confiance
    Write-Host ""
    Write-Host "Installation dans le magasin des autorités de certification racine..." -ForegroundColor Yellow
    
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
    $store.Open("ReadWrite")
    $store.Add($cert)
    $store.Close()
    
    Write-Host "✅ Certificat installé avec succès dans le magasin des autorités racines" -ForegroundColor Green
    
    # Vérifier l'installation
    Write-Host ""
    Write-Host "Vérification de l'installation..." -ForegroundColor Yellow
    
    $rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
    $rootStore.Open("ReadOnly")
    $installedCert = $rootStore.Certificates | Where-Object { $_.Thumbprint -eq $cert.Thumbprint } | Select-Object -First 1
    $rootStore.Close()
    
    if ($installedCert) {
        Write-Host "✅ Certificat trouvé dans le magasin des autorités racines" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Certificat non trouvé dans le magasin, l'installation a peut-être échoué" -ForegroundColor Yellow
    }
    
    # Instructions finales
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ INSTALLATION TERMINÉE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
    Write-Host "1. Redémarrez TOUS vos navigateurs"
    Write-Host "2. Testez https://localhost:8443/"
    Write-Host "3. Le certificat devrait maintenant être accepté"
    Write-Host ""
    Write-Host "Si le problème persiste:"
    Write-Host "- Exécutez ce script en tant qu'administrateur"
    Write-Host "- Ou utilisez le raccourci Chrome spécial"
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    
    # Suggestions en cas d'erreur
    Write-Host ""
    Write-Host "SUGGESTIONS:" -ForegroundColor Yellow
    Write-Host "1. Exécutez ce script en tant qu'administrateur"
    Write-Host "2. Vérifiez que le certificat existe et est valide"
    Write-Host "3. Essayez de redémarrer l'application eID Bridge"
    Write-Host "4. Utilisez la solution alternative avec Chrome"
    exit 1
}

# Attendre avant de fermer
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")