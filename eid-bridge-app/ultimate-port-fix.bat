@echo off
echo ========================================
echo SOLUTION ULTIME - Problème de port persistant
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: Ce script doit être exécuté en tant qu'administrateur.
    echo Clic droit sur le fichier et sélectionnez "Exécuter en tant qu'administrateur"
    pause
    exit /b 1
)

setlocal enabledelayedexpansion

echo [1/7] Diagnostic approfondi du port 9597...
echo.

REM Vérifier tous les états possibles du port
echo État détaillé du port 9597:
netstat -ano | findstr ":9597"
echo.

REM Trouver TOUS les processus qui utilisent ce port
echo Processus utilisant le port 9597:
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":9597"') do (
    if not "%%a"=="" (
        echo PID: %%a
        tasklist /FI "PID eq %%a" /FO LIST 2>nul | findstr "Image Name\|PID\|Session Name"
        echo.
    )
)

echo [2/7] Arrêt forcé de TOUS les processus .NET...

REM Méthode 1: Arrêt par nom d'image
taskkill /F /IM "dotnet.exe" >nul 2>&1
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1

REM Méthode 2: Arrêt par arbre de processus
taskkill /F /T /FI "IMAGENAME eq dotnet.exe" >nul 2>&1

REM Méthode 3: PowerShell pour tuer tous les processus .NET
powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*dotnet*' -or $_.ProcessName -like '*OphtalmoPro*'} | Stop-Process -Force -ErrorAction SilentlyContinue"

echo ✅ Processus .NET arrêtés

echo.
echo [3/7] Libération spécifique du port 9597...

REM Méthode 1: netstat + taskkill classique
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":9597"') do (
    if not "%%a"=="" (
        echo Arrêt du processus PID %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Méthode 2: PowerShell avec Get-NetTCPConnection
powershell -Command "try { Get-NetTCPConnection -LocalPort 9597 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host \"Arrêt PID: $($_.OwningProcess)\"; Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } catch { }"

REM Méthode 3: wmic pour trouver les processus réseau
for /f "skip=1 tokens=5" %%a in ('wmic process where "Name='dotnet.exe'" get ProcessId /format:csv 2^>nul') do (
    if not "%%a"=="" (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo ✅ Port 9597 libéré

echo.
echo [4/7] Nettoyage des réservations système...

REM Supprimer toutes les réservations HTTP sur ce port
netsh http delete urlacl url=https://+:9597/ >nul 2>&1
netsh http delete urlacl url=https://localhost:9597/ >nul 2>&1
netsh http delete urlacl url=https://127.0.0.1:9597/ >nul 2>&1
netsh http delete urlacl url=http://+:9597/ >nul 2>&1
netsh http delete urlacl url=http://localhost:9597/ >nul 2>&1

REM Supprimer les certificats SSL liés
netsh http delete sslcert ipport=0.0.0.0:9597 >nul 2>&1
netsh http delete sslcert ipport=127.0.0.1:9597 >nul 2>&1

echo ✅ Réservations système nettoyées

echo.
echo [5/7] Redémarrage des services réseau...

REM Redémarrer les services qui pourraient bloquer les ports
net stop "HTTP SSL" >nul 2>&1
net start "HTTP SSL" >nul 2>&1

REM Vider le cache DNS
ipconfig /flushdns >nul 2>&1

echo ✅ Services réseau redémarrés

echo.
echo [6/7] Attente de stabilisation...

echo Attente de 5 secondes pour la libération complète du port...
timeout /t 5 /nobreak >nul

echo.
echo [7/7] Vérification finale et test...

REM Test final du port
echo Test de disponibilité du port 9597:
netstat -an | findstr ":9597" >nul 2>&1
if !errorLevel! equ 0 (
    echo ❌ Port 9597 ENCORE UTILISÉ !
    echo.
    echo Processus restants:
    netstat -ano | findstr ":9597"
    echo.
    echo SOLUTION DRASTIQUE: Redémarrage requis
    echo.
    set /p reboot="Redémarrer maintenant? (O/N): "
    if /i "!reboot!"=="O" (
        echo Redémarrage en cours...
        shutdown /r /t 10 /c "Redémarrage pour libérer le port 9597"
        exit /b
    )
) else (
    echo ✅ Port 9597 LIBRE !
    
    REM Test de liaison pour confirmer
    echo Test de liaison sur le port...
    powershell -Command "try { $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 9597); $listener.Start(); Write-Host '✅ Port 9597 disponible pour liaison'; $listener.Stop() } catch { Write-Host \"❌ Erreur de liaison: $($_.Exception.Message)\" }"
)

echo.
echo ========================================
if !errorLevel! equ 0 (
    echo ✅ PROBLÈME RÉSOLU !
    echo ========================================
    echo.
    echo Le port 9597 est maintenant libre.
    echo Vous pouvez démarrer l'application avec safe-start.bat
) else (
    echo ❌ PROBLÈME PERSISTANT
    echo ========================================
    echo.
    echo Solutions restantes:
    echo 1. Redémarrer l'ordinateur
    echo 2. Changer le port dans le code source
    echo 3. Utiliser un port dynamique (0)
    echo 4. Vérifier les antivirus/pare-feu
)

echo.
pause