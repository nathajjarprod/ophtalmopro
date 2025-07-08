@echo off
echo ========================================
echo RÉSOLUTION PROBLÈME CERTIFICAT SSL
echo ========================================
echo.

echo Le navigateur Brave bloque le certificat auto-signé sur le port 9597.
echo.

echo [SOLUTION 1] Forcer l'acceptation du certificat
echo.
echo 1. Ouvrez Brave et allez sur: https://localhost:9597/
echo 2. Cliquez sur "Paramètres avancés"
echo 3. Cliquez sur "Continuer vers localhost (non sécurisé)"
echo 4. Ou tapez "thisisunsafe" directement sur la page d'erreur
echo.

echo [SOLUTION 2] Utiliser le port 8443 qui fonctionne
echo.
echo Le port 8443 fonctionne correctement, utilisez-le:
echo • Interface: https://localhost:8443/
echo • API: https://localhost:8443/api/
echo.

echo [SOLUTION 3] Configurer Brave pour ignorer les erreurs SSL
echo.
echo Lancez Brave avec ces paramètres:
echo --ignore-certificate-errors --ignore-ssl-errors --allow-running-insecure-content
echo.

echo [SOLUTION 4] Régénérer le certificat
echo.
set /p regen="Voulez-vous régénérer le certificat? (O/N): "
if /i "%regen%"=="O" (
    echo Régénération du certificat...
    call fix-certificate-issue.bat
)

echo.
echo ========================================
echo TESTS RAPIDES
echo ========================================
echo.

echo Test du port 8443 (qui fonctionne):
start https://localhost:8443/

echo.
echo Test du port 9597 (problématique):
echo Ouvrez manuellement: https://localhost:9597/
echo Et acceptez le certificat non sécurisé.

echo.
echo ========================================
echo RECOMMANDATION
echo ========================================
echo.
echo ✅ UTILISEZ LE PORT 8443 pour éviter les problèmes SSL
echo.
echo Dans votre application OphtalmoPro, utilisez:
echo const API_URL = 'https://localhost:8443/api';
echo.
echo Le port 8443 a un certificat qui fonctionne mieux avec Brave.
echo.
pause