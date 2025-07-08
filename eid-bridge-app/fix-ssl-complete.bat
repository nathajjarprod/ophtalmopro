@echo off
echo ========================================
echo SOLUTION COMPLÈTE SSL - eID Bridge
echo ========================================
echo.

echo [1/5] Vérification de l'application...
curl -k -s https://localhost:8443/api/status >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Application non accessible
    echo Démarrez d'abord l'application avec start-dev.bat
    pause
    exit /b 1
)
echo ✅ Application accessible

echo.
echo [2/5] Installation du certificat dans le store Windows...

REM Extraire le certificat et l'installer
powershell -Command "& {
    try {
        # Chemin du certificat
        $certPath = 'C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates\bridge-cert.pfx'
        $password = 'OphtalmoPro2024!'
        
        if (Test-Path $certPath) {
            Write-Host 'Installation du certificat dans le store Windows...'
            
            # Charger le certificat
            $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath, $password)
            
            # Installer dans le store des autorités de certification racine
            $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root', 'CurrentUser')
            $store.Open('ReadWrite')
            $store.Add($cert)
            $store.Close()
            
            Write-Host '✅ Certificat installé dans le store Windows'
            Write-Host \"Empreinte: $($cert.Thumbprint)\"
        } else {
            Write-Host '❌ Certificat non trouvé'
        }
    } catch {
        Write-Host \"❌ Erreur: $($_.Exception.Message)\"
    }
}"

echo.
echo [3/5] Configuration Chrome/Edge pour localhost...

REM Créer un raccourci Chrome avec flag SSL désactivé pour localhost
set "chromeFlags=--ignore-certificate-errors-spki-list --ignore-certificate-errors --ignore-ssl-errors --allow-running-insecure-content --disable-web-security --user-data-dir=%TEMP%\chrome-dev"

echo Création d'un raccourci Chrome pour développement...
powershell -Command "& {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Chrome-eID-Dev.lnk')
    $Shortcut.TargetPath = 'chrome.exe'
    $Shortcut.Arguments = '%chromeFlags% https://localhost:8443/'
    $Shortcut.WorkingDirectory = '%LOCALAPPDATA%\Google\Chrome\Application'
    $Shortcut.Description = 'Chrome pour développement eID Bridge'
    $Shortcut.Save()
    Write-Host '✅ Raccourci Chrome créé sur le bureau'
}"

echo.
echo [4/5] Test avec différents navigateurs...

echo Test Firefox (si installé)...
where firefox >nul 2>&1
if %errorLevel% equ 0 (
    start firefox -new-tab "https://localhost:8443/"
    echo ✅ Firefox ouvert
) else (
    echo ⚠️ Firefox non trouvé
)

echo Test Edge...
start msedge "https://localhost:8443/"
echo ✅ Edge ouvert

echo.
echo [5/5] Instructions finales...
echo.
echo ========================================
echo SOLUTIONS DISPONIBLES
echo ========================================
echo.
echo 1. CERTIFICAT INSTALLÉ dans Windows
echo    → Redémarrez votre navigateur
echo    → Le certificat devrait être accepté automatiquement
echo.
echo 2. RACCOURCI CHROME SPÉCIAL créé sur le bureau
echo    → "Chrome-eID-Dev.lnk" ignore les erreurs SSL
echo    → Utilisez-le pour tester l'application
echo.
echo 3. FLAGS MANUELS pour Chrome:
echo    chrome.exe %chromeFlags%
echo.
echo 4. FIREFOX: Acceptez manuellement le certificat
echo    → Cliquez sur "Avancé" puis "Accepter le risque"
echo.
echo 5. ALTERNATIVE: Utilisez curl pour les tests
echo    curl -k https://localhost:8443/api/status
echo.
echo ========================================
echo.
pause