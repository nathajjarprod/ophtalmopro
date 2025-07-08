@echo off
echo ========================================
echo TEST PORT UNIQUE 8443
echo ========================================
echo.

echo [1/3] Vérification du port...
netstat -an | findstr ":8443" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Port 8443 en écoute
    echo.
    echo Détails:
    netstat -ano | findstr ":8443"
) else (
    echo ❌ Port 8443 non utilisé
    echo L'application n'est pas démarrée ou utilise un autre port.
    echo.
    echo Ports alternatifs détectés:
    netstat -an | findstr ":844" | head -5
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Test de connectivité...
curl -k -s https://localhost:8443/api/status >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ API accessible sur port 8443
    echo.
    echo Réponse:
    curl -k -s https://localhost:8443/api/status
) else (
    echo ❌ API non accessible sur port 8443
    echo.
    echo Vérifications:
    echo 1. L'application est-elle démarrée ?
    echo 2. Le certificat SSL est-il valide ?
    echo 3. Le pare-feu bloque-t-il le port ?
)

echo.
echo [3/3] Test interface web...
echo Ouverture de https://localhost:8443/ dans le navigateur...
start https://localhost:8443/

echo.
echo ========================================
echo TEST TERMINÉ
echo ========================================
echo.
echo Si tout fonctionne, vous devriez voir:
echo ✅ Port 8443 en écoute
echo ✅ API accessible
echo ✅ Interface web ouverte
echo.
pause