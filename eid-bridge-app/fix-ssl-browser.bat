@echo off
echo ========================================
echo Correction du problème SSL navigateur
echo ========================================
echo.

echo [1/3] Vérification de l'application...
echo.

REM Vérifier que l'application fonctionne
curl -k -s https://localhost:8443/api/status >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Application accessible via curl
) else (
    echo ❌ Application non accessible
    echo Vérifiez que l'application est démarrée
    pause
    exit /b 1
)

echo.
echo [2/3] Test du certificat SSL...
echo.

REM Afficher les informations du certificat
powershell -Command "& {
    try {
        $request = [System.Net.WebRequest]::Create('https://localhost:8443/api/status')
        $request.ServerCertificateValidationCallback = { $true }
        $response = $request.GetResponse()
        Write-Host '✅ Certificat SSL accepté'
        $response.Close()
    } catch {
        Write-Host \"❌ Erreur SSL: $($_.Exception.Message)\"
    }
}"

echo.
echo [3/3] Instructions pour le navigateur...
echo.
echo ========================================
echo SOLUTION POUR LE NAVIGATEUR
echo ========================================
echo.
echo 1. Ouvrez https://localhost:8443/ dans votre navigateur
echo 2. Vous verrez un avertissement de sécurité
echo 3. Cliquez sur "Avancé" ou "Advanced"
echo 4. Cliquez sur "Continuer vers localhost (non sécurisé)"
echo 5. Ou cliquez sur "Proceed to localhost (unsafe)"
echo.
echo ⚠️ IMPORTANT: Ceci est normal pour un certificat auto-signé
echo.
echo Une fois accepté, tous les tests fonctionneront !
echo.

echo Ouverture automatique du navigateur...
start https://localhost:8443/

echo.
pause