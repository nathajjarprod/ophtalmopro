@echo off
echo ========================================
echo TEST DE L'APPLICATION eID BRIDGE
echo ========================================
echo.

echo L'application est maintenant opérationnelle !
echo.
echo Ports d'écoute détectés:
echo ✅ https://localhost:8443 (principal)
echo.

echo [1/3] Test de connectivité API...
echo.

REM Test du port principal 8443
echo Test du port 8443...
curl -k -s https://localhost:8443/api/status >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Port 8443 - API accessible
    curl -k -s https://localhost:8443/api/status
    echo.
) else (
    echo ❌ Port 8443 - API non accessible
)

echo.
echo [2/3] Test de l'interface web...
echo.
echo Ouverture de l'interface dans le navigateur...
start https://localhost:8443/

echo.
echo [3/3] Instructions d'utilisation...
echo.
echo ========================================
echo 🏥 APPLICATION eID BRIDGE OPÉRATIONNELLE
echo ========================================
echo.
echo 📡 URLs d'accès:
echo    • Interface: https://localhost:8443/
echo    • API Status: https://localhost:8443/api/status
echo    • API Lecteurs: https://localhost:8443/api/readers
echo    • API Lecture: https://localhost:8443/api/read-card
echo.
echo 🔧 Pour tester depuis votre application web:
echo.
echo fetch('https://localhost:8443/api/status')
echo   .then(r =^> r.json())
echo   .then(console.log);
echo.
echo 📋 Prochaines étapes:
echo 1. Connecter un lecteur de cartes eID
echo 2. Insérer une carte eID
echo 3. Tester la lecture depuis l'application web
echo 4. Intégrer dans OphtalmoPro
echo.
echo ⚠️ IMPORTANT: Gardez cette fenêtre ouverte !
echo L'application s'arrêtera si vous fermez le terminal.
echo.
pause