@echo off
echo ========================================
echo Configuration Port Unique - eID Bridge
echo ========================================
echo.

echo [1/3] Arrêt des processus existants...
taskkill /F /IM "dotnet.exe" >nul 2>&1
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1

echo [2/3] Nettoyage des ports...
for /L %%i in (8443,1,8450) do (
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%i "') do (
        if not "%%a"=="" (
            taskkill /F /PID %%a >nul 2>&1
        )
    )
)

echo [3/3] Configuration pour port unique...

REM Créer une configuration temporaire pour forcer un seul port
echo {> temp-config.json
echo   "Kestrel": {>> temp-config.json
echo     "Endpoints": {>> temp-config.json
echo       "HttpsOnly": {>> temp-config.json
echo         "Url": "https://localhost:8443">> temp-config.json
echo       }>> temp-config.json
echo     }>> temp-config.json
echo   }>> temp-config.json
echo }>> temp-config.json

echo ✅ Configuration port unique créée
echo.
echo Démarrage avec configuration forcée...
echo.

REM Démarrer avec la configuration temporaire
set ASPNETCORE_URLS=https://localhost:8443
dotnet run --configuration Release

REM Nettoyer
if exist temp-config.json del temp-config.json

pause