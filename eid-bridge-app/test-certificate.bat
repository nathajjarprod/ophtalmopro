@echo off
echo ========================================
echo Test du certificat SSL
echo ========================================
echo.

set "certDir=C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates"
set "certFile=%certDir%\bridge-cert.pfx"
set "password=OphtalmoPro2024!"

echo [1/3] Vérification de l'existence...

if exist "%certFile%" (
    echo ✅ Certificat trouvé: %certFile%
) else (
    echo ❌ Certificat non trouvé: %certFile%
    echo.
    echo Exécutez fix-certificate-issue.bat pour créer le certificat.
    pause
    exit /b 1
)

echo.
echo [2/3] Test de chargement...

powershell -Command "& {
    try {
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('%certFile%', '%password%');
        Write-Host '✅ Certificat chargé avec succès';
        Write-Host \"   Sujet: $($cert.Subject)\";
        Write-Host \"   Émetteur: $($cert.Issuer)\";
        Write-Host \"   Valide du: $($cert.NotBefore)\";
        Write-Host \"   Valide jusqu'au: $($cert.NotAfter)\";
        Write-Host \"   Empreinte: $($cert.Thumbprint)\";
        
        if ($cert.NotAfter -lt (Get-Date)) {
            Write-Host '⚠️ ATTENTION: Certificat expiré !';
        } elseif ($cert.NotAfter -lt (Get-Date).AddDays(30)) {
            Write-Host '⚠️ ATTENTION: Certificat expire bientôt !';
        } else {
            Write-Host '✅ Certificat valide';
        }
        
    } catch {
        Write-Host \"❌ Erreur de chargement: $($_.Exception.Message)\";
        exit 1;
    }
}"

if %errorLevel% neq 0 (
    echo.
    echo Le certificat est corrompu ou invalide.
    echo Exécutez fix-certificate-issue.bat pour le recréer.
    pause
    exit /b 1
)

echo.
echo [3/3] Test de compatibilité SSL...

powershell -Command "& {
    try {
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('%certFile%', '%password%');
        
        # Vérifier les usages de clé
        $keyUsage = $cert.Extensions | Where-Object { $_.Oid.FriendlyName -eq 'Key Usage' };
        if ($keyUsage) {
            Write-Host '✅ Extension Key Usage présente';
        } else {
            Write-Host '⚠️ Extension Key Usage manquante';
        }
        
        # Vérifier les noms alternatifs
        $san = $cert.Extensions | Where-Object { $_.Oid.FriendlyName -eq 'Subject Alternative Name' };
        if ($san) {
            Write-Host '✅ Extension SAN présente';
        } else {
            Write-Host '⚠️ Extension SAN manquante (peut causer des avertissements)';
        }
        
        # Vérifier la clé privée
        if ($cert.HasPrivateKey) {
            Write-Host '✅ Clé privée présente';
        } else {
            Write-Host '❌ Clé privée manquante';
        }
        
    } catch {
        Write-Host \"❌ Erreur de test: $($_.Exception.Message)\";
    }
}"

echo.
echo ========================================
echo Test terminé
echo ========================================
echo.
echo Si tous les tests sont OK, vous pouvez démarrer l'application.
echo Sinon, exécutez fix-certificate-issue.bat pour corriger les problèmes.
echo.
pause