@echo off
echo ========================================
echo Correction du problème de certificat
echo ========================================
echo.

echo [1/4] Diagnostic du problème...

set "certDir=C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates"
set "certFile=%certDir%\bridge-cert.pfx"

echo Répertoire certificats: %certDir%
echo Fichier certificat: %certFile%

if exist "%certDir%" (
    echo ✅ Répertoire certificats existe
) else (
    echo ❌ Répertoire certificats manquant
    echo Création du répertoire...
    mkdir "%certDir%"
    echo ✅ Répertoire créé
)

if exist "%certFile%" (
    echo ✅ Fichier certificat existe
    
    REM Tester le certificat
    powershell -Command "try { $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('%certFile%', 'OphtalmoPro2024!'); Write-Host '✅ Certificat valide'; } catch { Write-Host '❌ Certificat corrompu'; }" 2>nul
) else (
    echo ❌ Fichier certificat manquant
)

echo.
echo [2/4] Nettoyage des anciens certificats...

if exist "%certFile%" (
    echo Suppression de l'ancien certificat...
    del "%certFile%" >nul 2>&1
)

REM Nettoyer les certificats temporaires
del /Q "%TEMP%\*OphtalmoPro*" >nul 2>&1
del /Q "%LOCALAPPDATA%\Temp\*OphtalmoPro*" >nul 2>&1

echo ✅ Nettoyage terminé

echo.
echo [3/4] Génération d'un nouveau certificat...

REM Utiliser PowerShell pour créer un certificat auto-signé
powershell -Command "& {
    try {
        Write-Host 'Génération du certificat...';
        $cert = New-SelfSignedCertificate -DnsName 'localhost', '127.0.0.1', 'OphtalmoPro-eID-Bridge' -CertStoreLocation 'cert:\CurrentUser\My' -KeyAlgorithm RSA -KeyLength 2048 -KeyExportPolicy Exportable -KeyUsage DigitalSignature, KeyEncipherment -Type SSLServerAuthentication -NotAfter (Get-Date).AddYears(5);
        
        Write-Host 'Export du certificat...';
        $pwd = ConvertTo-SecureString -String 'OphtalmoPro2024!' -Force -AsPlainText;
        Export-PfxCertificate -Cert $cert -FilePath '%certFile%' -Password $pwd | Out-Null;
        
        Write-Host 'Nettoyage du store...';
        Remove-Item -Path \"cert:\CurrentUser\My\$($cert.Thumbprint)\" -Force;
        
        Write-Host '✅ Certificat créé avec succès';
    } catch {
        Write-Host \"❌ Erreur: $($_.Exception.Message)\";
        exit 1;
    }
}"

if %errorLevel% neq 0 (
    echo.
    echo Tentative avec méthode alternative...
    
    REM Créer un certificat basique avec .NET
    powershell -Command "& {
        Add-Type -AssemblyName System.Security;
        $rsa = [System.Security.Cryptography.RSA]::Create(2048);
        $req = New-Object System.Security.Cryptography.X509Certificates.CertificateRequest('CN=OphtalmoPro eID Bridge', $rsa, [System.Security.Cryptography.HashAlgorithmName]::SHA256, [System.Security.Cryptography.RSASignaturePadding]::Pkcs1);
        $cert = $req.CreateSelfSigned([System.DateTimeOffset]::Now.AddDays(-1), [System.DateTimeOffset]::Now.AddYears(5));
        $pfxBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, 'OphtalmoPro2024!');
        [System.IO.File]::WriteAllBytes('%certFile%', $pfxBytes);
        Write-Host '✅ Certificat alternatif créé';
    }"
)

echo.
echo [4/4] Vérification finale...

if exist "%certFile%" (
    echo ✅ Certificat créé: %certFile%
    
    REM Tester le certificat
    powershell -Command "& {
        try {
            $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('%certFile%', 'OphtalmoPro2024!');
            Write-Host \"✅ Certificat valide jusqu'au: $($cert.NotAfter)\";
        } catch {
            Write-Host \"❌ Erreur de validation: $($_.Exception.Message)\";
        }
    }"
    
    echo.
    echo ========================================
    echo ✅ PROBLÈME RÉSOLU
    echo ========================================
    echo.
    echo Le certificat SSL a été créé avec succès.
    echo Vous pouvez maintenant démarrer l'application.
    
) else (
    echo ❌ Impossible de créer le certificat
    echo.
    echo ========================================
    echo ❌ PROBLÈME NON RÉSOLU
    echo ========================================
    echo.
    echo Solutions alternatives:
    echo 1. Exécuter ce script en tant qu'administrateur
    echo 2. Installer PowerShell 5.0 ou plus récent
    echo 3. Laisser l'application générer le certificat automatiquement
    echo 4. Utiliser un certificat existant
)

echo.
pause