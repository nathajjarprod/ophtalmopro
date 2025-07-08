@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Démarrage Développement
echo ========================================
echo.

echo [1/2] Nettoyage des processus existants...
taskkill /F /IM "dotnet.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/2] Démarrage en mode développement...
echo.
echo ========================================
echo Démarrage sur https://localhost:8443
echo ========================================
echo.

dotnet run --launch-profile "OphtalmoPro.EidBridge"

pause