@echo off
echo ========================================
echo Création d'un certificat de confiance
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️ ATTENTION: Privilèges administrateur recommandés
    echo Clic droit sur le fichier et sélectionnez "Exécuter en tant qu'administrateur"
    echo.
    echo Continuer quand même? (O/N)
    set /p continue=
    if /i not "%continue%"=="O" exit /b
)

echo [1/4] Suppression de l'ancien certificat...
set "certDir=C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates"
set "certFile=%certDir%\bridge-cert.pfx"

if exist "%certFile%" (
    del "%certFile%"
    echo ✅ Ancien certificat supprimé
)

echo.
echo [2/4] Génération d'un nouveau certificat avec SAN...

powershell -Command "& {
    try {
        Write-Host 'Génération du certificat avec Subject Alternative Names...'
        
        # Créer un certificat avec SAN pour localhost
        $cert = New-SelfSignedCertificate -DnsName 'localhost', '127.0.0.1', 'OphtalmoPro-eID-Bridge' -CertStoreLocation 'cert:\CurrentUser\My' -KeyAlgorithm RSA -KeyLength 2048 -KeyExportPolicy Exportable -KeyUsage DigitalSignature, KeyEncipherment -Type SSLServerAuthentication -NotAfter (Get-Date).AddYears(5) -FriendlyName 'OphtalmoPro eID Bridge Certificate'
        
        # Export vers fichier PFX
        $pwd = ConvertTo-SecureString -String 'OphtalmoPro2024!' -Force -AsPlainText
        Export-PfxCertificate -Cert $cert -FilePath '%certFile%' -Password $pwd | Out-Null
        
        Write-Host '✅ Certificat créé avec SAN'
        Write-Host \"Empreinte: $($cert.Thumbprint)\"
        
        # Copier vers le store des autorités racines
        $rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root', 'CurrentUser')
        $rootStore.Open('ReadWrite')
        $rootStore.Add($cert)
        $rootStore.Close()
        
        Write-Host '✅ Certificat ajouté au store racine'
        
        # Nettoyer le store personnel
        Remove-Item -Path \"cert:\CurrentUser\My\$($cert.Thumbprint)\" -Force
        
    } catch {
        Write-Host \"❌ Erreur: $($_.Exception.Message)\"
        exit 1
    }
}"

if %errorLevel% neq 0 (
    echo ❌ Erreur lors de la création du certificat
    pause
    exit /b 1
)

echo.
echo [3/4] Vérification du certificat...

if exist "%certFile%" (
    echo ✅ Certificat créé: %certFile%
    
    powershell -Command "& {
        try {
            $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('%certFile%', 'OphtalmoPro2024!')
            Write-Host \"Sujet: $($cert.Subject)\"
            Write-Host \"Valide jusqu'au: $($cert.NotAfter)\"
            Write-Host \"SAN: $($cert.Extensions | Where-Object {$_.Oid.FriendlyName -eq 'Subject Alternative Name'} | Select-Object -ExpandProperty Format -First 1)\"
        } catch {
            Write-Host \"❌ Erreur de validation: $($_.Exception.Message)\"
        }
    }"
) else (
    echo ❌ Certificat non créé
    pause
    exit /b 1
)

echo.
echo [4/4] Instructions finales...
echo.
echo ========================================
echo ✅ CERTIFICAT DE CONFIANCE CRÉÉ
echo ========================================
echo.
echo Le certificat a été installé dans le store Windows.
echo.
echo PROCHAINES ÉTAPES:
echo 1. Redémarrez l'application eID Bridge
echo 2. Redémarrez votre navigateur
echo 3. Testez https://localhost:8443/
echo.
echo Si le problème persiste:
echo 1. Redémarrez Windows
echo 2. Ou utilisez le raccourci Chrome spécial
echo.
pause