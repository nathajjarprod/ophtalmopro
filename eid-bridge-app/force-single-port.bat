@echo off
echo ========================================
echo FORCER UN SEUL PORT - 8443
echo ========================================
echo.

echo [1/4] Arrêt complet...
taskkill /F /IM "dotnet.exe" >nul 2>&1
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Libération du port 8443...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8443 "') do (
    if not "%%a"=="" (
        echo Arrêt du processus PID %%a sur port 8443
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [3/4] Vérification...
netstat -an | findstr ":8443" >nul 2>&1
if %errorLevel% equ 0 (
    echo ❌ Port 8443 encore utilisé !
    netstat -ano | findstr ":8443"
    echo.
    echo Redémarrage requis pour libérer complètement le port.
    set /p reboot="Redémarrer maintenant? (O/N): "
    if /i "%reboot%"=="O" (
        shutdown /r /t 30 /c "Redémarrage pour libérer le port 8443"
        exit /b
    )
) else (
    echo ✅ Port 8443 libre
)

echo [4/4] Démarrage avec port unique...
echo.
echo ========================================
echo DÉMARRAGE AVEC PORT UNIQUE 8443
echo ========================================
echo.

REM Forcer un seul port via variable d'environnement
set ASPNETCORE_URLS=https://localhost:8443
set ASPNETCORE_HTTPS_PORT=8443

echo Variables configurées:
echo ASPNETCORE_URLS=%ASPNETCORE_URLS%
echo ASPNETCORE_HTTPS_PORT=%ASPNETCORE_HTTPS_PORT%
echo.

dotnet run --configuration Release

pause