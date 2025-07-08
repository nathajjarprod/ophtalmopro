@echo off
echo ========================================
echo Redémarrage propre de OphtalmoPro eID Bridge
echo ========================================
echo.

echo [1/3] Arrêt complet...
call force-kill-ports.bat

echo.
echo [2/3] Attente de stabilisation...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Redémarrage...
echo Démarrage de l'application...

REM Démarrer l'application
dotnet run --project OphtalmoPro.EidBridge.csproj

pause