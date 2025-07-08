@echo off
echo ========================================
echo DÉMARRAGE PROPRE - Port 8443 Unique
echo ========================================
echo.

echo [1/4] Nettoyage rapide...
taskkill /F /IM "dotnet.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/4] Vérification du port 8443...
netstat -an | findstr ":8443" >nul 2>&1
if %errorLevel% equ 0 (
    echo ⚠️ Port 8443 utilisé - Nettoyage nécessaire
    call nuclear-port-cleanup.bat
    exit /b
) else (
    echo ✅ Port 8443 libre
)

echo [3/4] Configuration environnement...
set ASPNETCORE_URLS=https://localhost:8443
set ASPNETCORE_HTTPS_PORT=8443
set ASPNETCORE_ENVIRONMENT=Production

echo [4/4] Démarrage application...
echo.
echo ========================================
echo APPLICATION DÉMARRÉE SUR PORT 8443 UNIQUE
echo ========================================
echo.

dotnet run --configuration Release

pause