@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Démarrage Production
echo ========================================
echo.

echo [1/2] Nettoyage des processus existants...
taskkill /F /IM "dotnet.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/2] Démarrage en mode production...
echo.
echo ========================================
echo Démarrage sur https://localhost:8443 (Production)
echo ========================================
echo.

dotnet run --launch-profile "OphtalmoPro.EidBridge.Production"

pause