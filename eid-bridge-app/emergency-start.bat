@echo off
echo ========================================
echo DÉMARRAGE D'URGENCE - Port Dynamique
echo ========================================
echo.

echo Ce script démarre l'application sur un port libre automatiquement.
echo.

echo [1/3] Nettoyage rapide...
taskkill /F /IM "dotnet.exe" >nul 2>&1
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Modification temporaire pour port dynamique...

REM Créer une copie de sauvegarde des paramètres
copy appsettings.json appsettings.json.backup >nul 2>&1

REM Modifier temporairement pour utiliser un port dynamique (0)
powershell -Command "(Get-Content appsettings.json) -replace '\"Url\": \"https://localhost:9597\"', '\"Url\": \"https://localhost:0\"' | Set-Content appsettings.json"

echo [3/3] Démarrage avec port automatique...
echo.
echo ========================================
echo L'application va démarrer sur un port libre
echo ========================================
echo.

REM Démarrer l'application
dotnet run --configuration Release

REM Restaurer les paramètres originaux
if exist appsettings.json.backup (
    move appsettings.json.backup appsettings.json >nul 2>&1
)

echo.
echo Application fermée. Paramètres restaurés.
pause