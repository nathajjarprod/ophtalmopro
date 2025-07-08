@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Test de Connexion
echo ========================================
echo.

echo [1/5] Vérification du service Windows...

REM Vérifier le statut du service
sc query "OphtalmoPro eID Bridge" >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Service non installé ou non trouvé.
    echo Exécutez install-service.bat pour installer le service.
    goto :end
)

for /f "tokens=3" %%i in ('sc query "OphtalmoPro eID Bridge" ^| findstr "STATE"') do set SERVICE_STATE=%%i

if "%SERVICE_STATE%"=="RUNNING" (
    echo ✅ Service en cours d'exécution
) else (
    echo ⚠️ Service installé mais non démarré (État: %SERVICE_STATE%)
    echo Tentative de démarrage...
    sc start "OphtalmoPro eID Bridge"
    timeout /t 5 /nobreak >nul
)

echo.
echo [2/5] Test de connectivité réseau...

REM Vérifier si le port est ouvert
netstat -an | findstr ":9597" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Port 9597 en écoute
) else (
    echo ❌ Port 9597 non accessible
    echo Le service n'a peut-être pas encore démarré complètement.
)

echo.
echo [3/5] Test de l'API de statut...

REM Tester l'endpoint de statut
curl -k -s https://localhost:9597/api/status >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ API accessible
    echo.
    echo Détails du statut:
    curl -k -s https://localhost:9597/api/status
) else (
    echo ❌ API non accessible
    echo Vérifiez les logs: C:\ProgramData\OphtalmoPro\eID-Bridge\Logs\
)

echo.
echo [4/5] Test du middleware eID...

REM Tester la connectivité avec le middleware eID belge
echo Test des ports middleware eID...
for %%p in (53001 35963 35964 24727) do (
    curl -s http://localhost:%%p/service/info >nul 2>&1
    if !errorLevel! equ 0 (
        echo ✅ Middleware eID trouvé sur le port %%p
        set MIDDLEWARE_FOUND=1
    ) else (
        echo ⚠️ Port %%p non accessible
    )
)

if not defined MIDDLEWARE_FOUND (
    echo.
    echo ❌ Aucun middleware eID détecté !
    echo.
    echo Solutions:
    echo 1. Installer le middleware eID depuis: https://eid.belgium.be/fr/middleware-eid
    echo 2. Redémarrer après installation
    echo 3. Tester avec eID Viewer
    echo 4. Vérifier que le service "Belgium eID Middleware" est démarré
)

echo.
echo [5/5] Test des lecteurs de cartes...

REM Tester l'endpoint des lecteurs
curl -k -s https://localhost:9597/api/readers >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Endpoint lecteurs accessible
    echo.
    echo Lecteurs détectés:
    curl -k -s https://localhost:9597/api/readers
) else (
    echo ❌ Impossible de récupérer les lecteurs
)

echo.
echo ========================================
echo Test terminé
echo ========================================
echo.

REM Résumé final
if defined MIDDLEWARE_FOUND (
    echo ✅ Configuration opérationnelle
    echo.
    echo Votre application web peut maintenant utiliser:
    echo - URL API: https://localhost:9597/api/
    echo - Endpoint lecture: POST /api/read-card
    echo - Endpoint statut: GET /api/status
    echo.
    echo Exemple d'utilisation JavaScript:
    echo fetch('https://localhost:9597/api/read-card', {
    echo   method: 'POST',
    echo   headers: { 'Content-Type': 'application/json' },
    echo   body: JSON.stringify({ includePhoto: true, includeAddress: true })
    echo }).then(r =^> r.json()).then(console.log);
) else (
    echo ⚠️ Configuration incomplète
    echo.
    echo Actions requises:
    echo 1. Installer le middleware eID belge
    echo 2. Connecter un lecteur de cartes
    echo 3. Redémarrer le service OphtalmoPro eID Bridge
    echo 4. Relancer ce test
)

:end
echo.
echo Appuyez sur une touche pour continuer...
pause >nul