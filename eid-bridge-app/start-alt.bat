@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Port Alternatif
echo ========================================
echo.

echo [1/2] Nettoyage des processus existants...
taskkill /F /IM "dotnet.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/2] Démarrage sur port alternatif...
echo.
echo ========================================
echo Démarrage sur https://localhost:8444 (Alternatif)
echo ========================================
echo.

dotnet run --launch-profile "OphtalmoPro.EidBridge.Alternative"

pause