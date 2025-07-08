@echo off
echo ========================================
echo Test direct de l'API eID Bridge
echo ========================================
echo.

echo [1/4] Test de base...
echo.
curl -k -s https://localhost:8443/api/status
echo.

echo.
echo [2/4] Test avec headers détaillés...
echo.
curl -k -v https://localhost:8443/api/status 2>&1 | findstr "HTTP\|SSL\|TLS\|certificate"

echo.
echo [3/4] Test des lecteurs...
echo.
curl -k -s https://localhost:8443/api/readers

echo.
echo [4/4] Test de diagnostic...
echo.
curl -k -s https://localhost:8443/api/diagnostic

echo.
echo ========================================
echo Tests terminés
echo ========================================
echo.
pause