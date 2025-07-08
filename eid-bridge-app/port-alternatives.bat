@echo off
echo ========================================
echo PORTS ALTERNATIFS AUTOMATIQUES
echo ========================================
echo.

echo Test de ports alternatifs disponibles...
echo.

REM Liste de ports alternatifs à tester
set "ports=8443 8444 8445 9598 9599 9600 7443 7444 7445 6443 6444 6445"

for %%p in (%ports%) do (
    echo Test du port %%p...
    netstat -an | findstr ":%%p " >nul 2>&1
    if !errorLevel! neq 0 (
        echo ✅ Port %%p LIBRE - Configuration...
        
        REM Sauvegarder la configuration actuelle
        copy appsettings.json appsettings.backup.json >nul 2>&1
        
        REM Modifier le port
        powershell -Command "(Get-Content appsettings.json) -replace '9597', '%%p' | Set-Content appsettings.json"
        
        echo ✅ Port configuré sur %%p
        echo.
        echo Tentative de démarrage...
        
        REM Tenter de démarrer l'application
        timeout /t 2 /nobreak >nul
        start /min dotnet run --configuration Release
        
        REM Attendre et tester
        timeout /t 10 /nobreak >nul
        
        REM Tester si l'application répond
        curl -k -s https://localhost:%%p/api/status >nul 2>&1
        if !errorLevel! equ 0 (
            echo.
            echo ========================================
            echo ✅ SUCCÈS ! Application démarrée sur port %%p
            echo ========================================
            echo.
            echo URL d'accès: https://localhost:%%p/api/
            echo.
            echo L'application est maintenant opérationnelle.
            pause
            exit /b 0
        ) else (
            echo ❌ Port %%p ne fonctionne pas non plus
            REM Restaurer la configuration
            copy appsettings.backup.json appsettings.json >nul 2>&1
            REM Tuer le processus
            taskkill /F /IM dotnet.exe >nul 2>&1
        )
    ) else (
        echo ❌ Port %%p occupé
    )
    echo.
)

echo.
echo ========================================
echo ❌ AUCUN PORT ALTERNATIF DISPONIBLE
echo ========================================
echo.
echo Solutions restantes:
echo 1. Redémarrer l'ordinateur
echo 2. Désactiver temporairement l'antivirus
echo 3. Vérifier les services Windows en conflit
echo 4. Utiliser un autre ordinateur pour tester
echo.
pause