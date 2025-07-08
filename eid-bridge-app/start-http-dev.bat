@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Mode HTTP (Dev)
echo ========================================
echo.

echo ⚠️ ATTENTION: Mode HTTP non sécurisé
echo Ce mode est uniquement pour les tests de développement
echo.

echo [1/2] Nettoyage des processus existants...
taskkill /F /IM "dotnet.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/2] Démarrage en mode HTTP...
echo.
echo ========================================
echo Démarrage sur http://localhost:8080 (HTTP)
echo ========================================
echo.

REM Configurer pour HTTP uniquement
set ASPNETCORE_URLS=http://localhost:8080
set ASPNETCORE_ENVIRONMENT=Development

dotnet run

pause