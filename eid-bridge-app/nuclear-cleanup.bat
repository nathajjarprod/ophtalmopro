@echo off
echo ========================================
echo NETTOYAGE NUCLÉAIRE - OphtalmoPro eID Bridge
echo ========================================
echo.
echo ⚠️  ATTENTION: Ce script va forcer l'arrêt de TOUS les processus .NET
echo ⚠️  Sauvegardez votre travail avant de continuer!
echo.
set /p confirm="Continuer? (O/N): "
if /i not "%confirm%"=="O" (
    echo Opération annulée.
    pause
    exit /b
)

echo.
echo [1/8] Arrêt de tous les processus .NET et OphtalmoPro...

REM Arrêter tous les processus dotnet
taskkill /F /IM "dotnet.exe" >nul 2>&1
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1
taskkill /F /T /FI "IMAGENAME eq dotnet.exe" >nul 2>&1

echo ✅ Processus .NET arrêtés

echo.
echo [2/8] Suppression du service Windows...

sc stop "OphtalmoPro eID Bridge" >nul 2>&1
timeout /t 2 /nobreak >nul
sc delete "OphtalmoPro eID Bridge" >nul 2>&1

echo ✅ Service Windows supprimé

echo.
echo [3/8] Libération forcée des ports 9597-9604...

for /L %%i in (9597,1,9604) do (
    echo Libération du port %%i...
    
    REM Méthode 1: netstat + taskkill
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%i "') do (
        if not "%%a"=="" (
            taskkill /F /PID %%a >nul 2>&1
        )
    )
    
    REM Méthode 2: PowerShell pour forcer la fermeture
    powershell -Command "Get-NetTCPConnection -LocalPort %%i -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
)

echo ✅ Ports libérés

echo.
echo [4/8] Nettoyage des réservations d'URL...

for /L %%i in (9597,1,9604) do (
    netsh http delete urlacl url=https://+:%%i/ >nul 2>&1
    netsh http delete urlacl url=https://localhost:%%i/ >nul 2>&1
    netsh http delete urlacl url=https://127.0.0.1:%%i/ >nul 2>&1
)

echo ✅ Réservations d'URL nettoyées

echo.
echo [5/8] Nettoyage du pare-feu Windows...

netsh advfirewall firewall delete rule name="OphtalmoPro eID Bridge" >nul 2>&1
for /L %%i in (9597,1,9604) do (
    netsh advfirewall firewall delete rule protocol=TCP localport=%%i >nul 2>&1
)

echo ✅ Règles de pare-feu nettoyées

echo.
echo [6/8] Nettoyage des certificats temporaires...

del /Q "%TEMP%\OphtalmoPro*" >nul 2>&1
del /Q "%LOCALAPPDATA%\Temp\OphtalmoPro*" >nul 2>&1

echo ✅ Certificats temporaires nettoyés

echo.
echo [7/8] Nettoyage des processus orphelins...

REM Chercher tous les processus qui écoutent sur nos ports
for /L %%i in (9597,1,9604) do (
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%i "') do (
        if not "%%a"=="" (
            echo Arrêt forcé du processus PID %%a (port %%i)
            taskkill /F /PID %%a >nul 2>&1
        )
    )
)

echo ✅ Processus orphelins nettoyés

echo.
echo [8/8] Vérification finale...

echo Vérification des ports...
set "allClear=true"
for /L %%i in (9597,1,9604) do (
    netstat -an | findstr ":%%i " >nul 2>&1
    if !errorLevel! equ 0 (
        echo ❌ Port %%i encore utilisé
        set "allClear=false"
    ) else (
        echo ✅ Port %%i libre
    )
)

echo.
if "%allClear%"=="true" (
    echo ========================================
    echo ✅ NETTOYAGE RÉUSSI
    echo ========================================
    echo.
    echo Tous les ports sont maintenant libres.
    echo Vous pouvez relancer l'application.
) else (
    echo ========================================
    echo ⚠️ NETTOYAGE PARTIEL
    echo ========================================
    echo.
    echo Certains ports sont encore utilisés.
    echo Redémarrez votre ordinateur pour un nettoyage complet.
)

echo.
pause