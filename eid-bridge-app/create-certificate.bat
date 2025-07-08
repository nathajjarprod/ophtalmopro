@echo off
echo ========================================
echo Création du certificat SSL pour eID Bridge
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: Ce script doit être exécuté en tant qu'administrateur.
    echo Clic droit sur le fichier et sélectionnez "Exécuter en tant qu'administrateur"
    pause
    exit /b 1
)

echo [1/3] Création des répertoires...

set "certDir=C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates"
if not exist "%certDir%" mkdir "%certDir%"

echo ✅ Répertoire créé: %certDir%

echo.
echo [2/3] Génération du certificat auto-signé...

set "certFile=%certDir%\bridge-cert.pfx"
set "password=OphtalmoPro2024!"

REM Supprimer l'ancien certificat s'il existe
if exist "%certFile%" (
    echo Suppression de l'ancien certificat...
    del "%certFile%"
)

REM Créer un certificat auto-signé avec PowerShell
powershell -Command "& {
    $cert = New-SelfSignedCertificate -DnsName 'localhost', '127.0.0.1' -CertStoreLocation 'cert:\LocalMachine\My' -KeyAlgorithm RSA -KeyLength 2048 -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider' -KeyExportPolicy Exportable -KeyUsage DigitalSignature, KeyEncipherment -Type SSLServerAuthentication -ValidityPeriod Years -ValidityPeriodUnits 5;
    $pwd = ConvertTo-SecureString -String '%password%' -Force -AsPlainText;
    Export-PfxCertificate -Cert $cert -FilePath '%certFile%' -Password $pwd;
    Remove-Item -Path \"cert:\LocalMachine\My\$($cert.Thumbprint)\" -Force;
    Write-Host 'Certificat créé avec succès';
}"

if exist "%certFile%" (
    echo ✅ Certificat créé: %certFile%
) else (
    echo ❌ Erreur lors de la création du certificat
    echo.
    echo Tentative avec méthode alternative...
    
    REM Méthode alternative avec makecert (si disponible)
    makecert -r -pe -n "CN=OphtalmoPro eID Bridge" -ss my -sr LocalMachine -a sha256 -len 2048 -cy end -sky exchange -sp "Microsoft RSA SChannel Cryptographic Provider" -sy 12 "%certFile%" >nul 2>&1
    
    if exist "%certFile%" (
        echo ✅ Certificat créé avec makecert
    ) else (
        echo ❌ Impossible de créer le certificat
        echo.
        echo Solutions:
        echo 1. Installer les outils de développement Windows SDK
        echo 2. Utiliser OpenSSL
        echo 3. Laisser l'application générer le certificat automatiquement
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Vérification du certificat...

if exist "%certFile%" (
    echo ✅ Certificat présent: %certFile%
    
    REM Afficher les informations du certificat
    powershell -Command "& {
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('%certFile%', '%password%');
        Write-Host \"Sujet: $($cert.Subject)\";
        Write-Host \"Valide du: $($cert.NotBefore)\";
        Write-Host \"Valide jusqu'au: $($cert.NotAfter)\";
        Write-Host \"Empreinte: $($cert.Thumbprint)\";
    }"
) else (
    echo ❌ Certificat non trouvé
    exit /b 1
)

echo.
echo ========================================
echo Certificat SSL créé avec succès !
echo ========================================
echo.
echo Vous pouvez maintenant démarrer l'application eID Bridge.
echo.
pause