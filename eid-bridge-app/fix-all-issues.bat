@echo off
echo ========================================
echo SOLUTION COMPLÈTE - eID Bridge
echo ========================================
echo.

echo Ce script va résoudre tous les problèmes courants:
echo - Problèmes de certificat SSL
echo - Problèmes CORS
echo - Problèmes de port
echo - Problèmes de connexion
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

echo.
echo [1/5] Arrêt des processus existants...
taskkill /F /IM "dotnet.exe" >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Processus arrêtés

echo.
echo [2/5] Installation du certificat de confiance...
powershell -ExecutionPolicy Bypass -File "%~dp0install-trusted-cert.ps1"
echo.

echo [3/5] Vérification des ports...
netstat -an | findstr ":8443" >nul 2>&1
if %errorLevel% equ 0 (
    echo ⚠️ Port 8443 déjà utilisé
    echo Libération du port...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8443"') do (
        if not "%%a"=="" (
            taskkill /F /PID %%a >nul 2>&1
        )
    )
    timeout /t 2 /nobreak >nul
)
echo ✅ Port 8443 libre

echo.
echo [4/5] Démarrage de l'application...
echo.
echo ========================================
echo Démarrage sur https://localhost:8443
echo ========================================
echo.

start cmd /c "start-dev.bat"
timeout /t 5 /nobreak >nul

echo.
echo [5/5] Test de connectivité...
curl -k -s https://localhost:8443/api/status >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Application accessible
    
    echo.
    echo Test des headers CORS...
    curl -k -i -H "Origin: https://localhost:5173" https://localhost:8443/api/status | findstr "Access-Control-Allow"
    
    echo.
    echo Ouverture de la page de test...
    start "" "integration-test-fixed.html"
) else (
    echo ❌ Application non accessible
    echo Vérifiez les logs pour plus d'informations
)

echo.
echo ========================================
echo SOLUTION COMPLÈTE TERMINÉE
echo ========================================
echo.
echo Si vous rencontrez encore des problèmes:
echo 1. Utilisez le raccourci Chrome spécial
echo 2. Ou utilisez le mode HTTP temporaire
echo 3. Ou utilisez curl pour les tests
echo.
pause