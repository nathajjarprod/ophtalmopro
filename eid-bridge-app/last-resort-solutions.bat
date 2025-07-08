@echo off
echo ========================================
echo SOLUTIONS ULTIMES - Port 9597 Persistant
echo ========================================
echo.

echo [OPTION 1] Changer le port dans le code source
echo.
echo 1. Ouvrez appsettings.json
echo 2. Changez "Url": "https://localhost:9597" vers "https://localhost:8443"
echo 3. Sauvegardez et relancez
echo.
set /p option1="Essayer l'option 1? (O/N): "
if /i "%option1%"=="O" (
    echo Modification du port vers 8443...
    powershell -Command "(Get-Content appsettings.json) -replace '9597', '8443' | Set-Content appsettings.json"
    echo ✅ Port changé vers 8443
    echo Relancez avec: dotnet run
    pause
    exit /b
)

echo.
echo [OPTION 2] Utiliser un port dynamique (0)
echo.
set /p option2="Essayer l'option 2? (O/N): "
if /i "%option2%"=="O" (
    echo Modification vers port dynamique...
    powershell -Command "(Get-Content appsettings.json) -replace '9597', '0' | Set-Content appsettings.json"
    echo ✅ Port configuré en dynamique
    echo L'application choisira un port libre automatiquement
    echo Relancez avec: dotnet run
    pause
    exit /b
)

echo.
echo [OPTION 3] Diagnostic réseau avancé
echo.
set /p option3="Essayer l'option 3? (O/N): "
if /i "%option3%"=="O" (
    echo === DIAGNOSTIC RÉSEAU AVANCÉ ===
    echo.
    echo 1. Vérification des réservations d'URL:
    netsh http show urlacl | findstr 9597
    echo.
    echo 2. Vérification des connexions TCP:
    netstat -ano | findstr :9597
    echo.
    echo 3. Vérification des processus .NET:
    tasklist | findstr dotnet
    echo.
    echo 4. Vérification du pare-feu:
    netsh advfirewall firewall show rule name=all | findstr 9597
    echo.
    pause
)

echo.
echo [OPTION 4] Réinitialisation complète du réseau
echo.
set /p option4="Essayer l'option 4? (O/N): "
if /i "%option4%"=="O" (
    echo ⚠️ ATTENTION: Cette option va réinitialiser la configuration réseau
    set /p confirm="Continuer? (O/N): "
    if /i "%confirm%"=="O" (
        echo Réinitialisation réseau...
        netsh int ip reset
        netsh winsock reset
        ipconfig /flushdns
        echo ✅ Réseau réinitialisé
        echo REDÉMARRAGE REQUIS pour prendre effet
        set /p reboot="Redémarrer maintenant? (O/N): "
        if /i "%reboot%"=="O" (
            shutdown /r /t 30 /c "Redémarrage pour réinitialisation réseau"
        )
    )
)

echo.
echo [OPTION 5] Mode développement sans HTTPS
echo.
set /p option5="Essayer l'option 5? (O/N): "
if /i "%option5%"=="O" (
    echo Configuration en mode HTTP simple...
    echo Création d'un fichier de configuration temporaire...
    
    echo { > appsettings.temp.json
    echo   "Logging": { >> appsettings.temp.json
    echo     "LogLevel": { >> appsettings.temp.json
    echo       "Default": "Information" >> appsettings.temp.json
    echo     } >> appsettings.temp.json
    echo   }, >> appsettings.temp.json
    echo   "AllowedHosts": "*", >> appsettings.temp.json
    echo   "Kestrel": { >> appsettings.temp.json
    echo     "Endpoints": { >> appsettings.temp.json
    echo       "Http": { >> appsettings.temp.json
    echo         "Url": "http://localhost:5000" >> appsettings.temp.json
    echo       } >> appsettings.temp.json
    echo     } >> appsettings.temp.json
    echo   } >> appsettings.temp.json
    echo } >> appsettings.temp.json
    
    copy appsettings.json appsettings.backup.json
    copy appsettings.temp.json appsettings.json
    del appsettings.temp.json
    
    echo ✅ Configuration HTTP créée sur port 5000
    echo Relancez avec: dotnet run
    echo Pour restaurer: copy appsettings.backup.json appsettings.json
    pause
    exit /b
)

echo.
echo ========================================
echo AUTRES OPTIONS DISPONIBLES
echo ========================================
echo.
echo A. Utiliser IIS Express au lieu de Kestrel
echo B. Configurer un reverse proxy (nginx/Apache)
echo C. Utiliser Docker pour isoler l'application
echo D. Passer à une architecture différente
echo E. Utiliser un service Windows au lieu de console
echo.
echo Pour ces options avancées, contactez le support technique.
echo.
pause