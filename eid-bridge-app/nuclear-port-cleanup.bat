@echo off
echo ========================================
echo NETTOYAGE NUCLÉAIRE PORT 8443
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️ ATTENTION: Privilèges administrateur recommandés pour un nettoyage complet
    echo Clic droit sur le fichier et sélectionnez "Exécuter en tant qu'administrateur"
    echo.
    echo Continuer quand même? (O/N)
    set /p continue=
    if /i not "%continue%"=="O" exit /b
)

echo [1/6] Arrêt de TOUS les processus .NET...
taskkill /F /T /FI "IMAGENAME eq dotnet.exe" >nul 2>&1
taskkill /F /T /FI "IMAGENAME eq OphtalmoPro.EidBridge.exe" >nul 2>&1
wmic process where "name='dotnet.exe'" delete >nul 2>&1

echo [2/6] Libération spécifique du port 8443...
echo Recherche des processus utilisant le port 8443...

REM Méthode 1: netstat + taskkill
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8443 "') do (
    if not "%%a"=="" (
        echo Arrêt du processus PID %%a (port 8443)
        taskkill /F /PID %%a >nul 2>&1
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

REM Méthode 2: PowerShell pour forcer la fermeture
powershell -Command "try { Get-NetTCPConnection -LocalPort 8443 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host \"Arrêt PID: $($_.OwningProcess)\"; Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } catch { }" >nul 2>&1

echo [3/6] Nettoyage des réservations système...
netsh http delete urlacl url=https://+:8443/ >nul 2>&1
netsh http delete urlacl url=https://localhost:8443/ >nul 2>&1
netsh http delete urlacl url=https://127.0.0.1:8443/ >nul 2>&1
netsh http delete sslcert ipport=0.0.0.0:8443 >nul 2>&1
netsh http delete sslcert ipport=127.0.0.1:8443 >nul 2>&1

echo [4/6] Nettoyage des processus orphelins...
REM Chercher tous les processus qui pourraient écouter sur 8443
wmic process where "CommandLine like '%%8443%%'" delete >nul 2>&1

echo [5/6] Attente de stabilisation...
timeout /t 3 /nobreak >nul

echo [6/6] Vérification finale...
netstat -an | findstr ":8443" >nul 2>&1
if %errorLevel% equ 0 (
    echo ❌ ÉCHEC: Port 8443 encore utilisé !
    echo.
    echo Processus restants:
    netstat -ano | findstr ":8443"
    echo.
    echo ========================================
    echo SOLUTION DRASTIQUE REQUISE
    echo ========================================
    echo.
    echo Le port 8443 est bloqué par un processus persistant.
    echo.
    echo OPTIONS:
    echo 1. Redémarrer l'ordinateur (recommandé)
    echo 2. Utiliser un port différent (8444, 8445, etc.)
    echo 3. Identifier manuellement le processus bloquant
    echo.
    set /p action="Que voulez-vous faire? (1=Redémarrer, 2=Port alternatif, 3=Manuel): "
    
    if "%action%"=="1" (
        echo Redémarrage programmé dans 30 secondes...
        shutdown /r /t 30 /c "Redémarrage pour libérer le port 8443"
        echo Annulez avec: shutdown /a
        pause
        exit /b
    )
    
    if "%action%"=="2" (
        echo Test des ports alternatifs...
        for /L %%p in (8444,1,8450) do (
            netstat -an | findstr ":%%p " >nul 2>&1
            if !errorLevel! neq 0 (
                echo ✅ Port %%p disponible
                echo.
                echo Modification de la configuration pour utiliser le port %%p...
                powershell -Command "(Get-Content appsettings.json) -replace '8443', '%%p' | Set-Content appsettings.json"
                echo Configuration mise à jour pour le port %%p
                echo.
                echo Démarrage sur le port %%p...
                set ASPNETCORE_URLS=https://localhost:%%p
                dotnet run --configuration Release
                exit /b
            )
        )
        echo ❌ Aucun port alternatif disponible
    )
    
    if "%action%"=="3" (
        echo.
        echo Processus utilisant le port 8443:
        netstat -ano | findstr ":8443"
        echo.
        echo Utilisez le Gestionnaire des tâches pour identifier et arrêter
        echo le processus correspondant au PID affiché.
        pause
    )
    
) else (
    echo ✅ SUCCÈS: Port 8443 libéré !
    echo.
    echo ========================================
    echo DÉMARRAGE PROPRE
    echo ========================================
    echo.
    
    REM Démarrage avec configuration propre
    set ASPNETCORE_URLS=https://localhost:8443
    set ASPNETCORE_HTTPS_PORT=8443
    
    echo Variables configurées:
    echo ASPNETCORE_URLS=%ASPNETCORE_URLS%
    echo ASPNETCORE_HTTPS_PORT=%ASPNETCORE_HTTPS_PORT%
    echo.
    
    echo Démarrage de l'application...
    dotnet run --configuration Release
)

pause