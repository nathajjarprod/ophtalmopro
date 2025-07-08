@echo off
echo ========================================
echo Diagnostic complet du problème de port
echo ========================================
echo.

setlocal enabledelayedexpansion

echo [1/6] Vérification des ports 9597-9604...
echo.

for /L %%i in (9597,1,9604) do (
    echo === PORT %%i ===
    
    REM Vérifier si le port est en écoute
    netstat -an | findstr ":%%i " >nul 2>&1
    if !errorLevel! equ 0 (
        echo ❌ Port %%i EN UTILISATION
        
        REM Trouver quel processus utilise le port
        for /f "tokens=2,5" %%a in ('netstat -ano ^| findstr ":%%i "') do (
            if not "%%b"=="" (
                echo    └─ État: %%a, PID: %%b
                
                REM Obtenir le nom du processus
                for /f "skip=1 tokens=1" %%c in ('tasklist /FI "PID eq %%b" /FO CSV /NH 2^>nul') do (
                    set "processName=%%c"
                    set "processName=!processName:"=!"
                    echo    └─ Processus: !processName!
                )
            )
        )
    ) else (
        echo ✅ Port %%i LIBRE
    )
    echo.
)

echo [2/6] Processus .NET en cours...
echo.
tasklist | findstr /I "dotnet\|OphtalmoPro" >nul 2>&1
if !errorLevel! equ 0 (
    echo Processus .NET trouvés:
    tasklist | findstr /I "dotnet\|OphtalmoPro"
) else (
    echo ✅ Aucun processus .NET en cours
)
echo.

echo [3/6] Services Windows OphtalmoPro...
echo.
sc query "OphtalmoPro eID Bridge" >nul 2>&1
if !errorLevel! equ 0 (
    echo Service Windows trouvé:
    sc query "OphtalmoPro eID Bridge"
) else (
    echo ✅ Aucun service Windows OphtalmoPro
)
echo.

echo [4/6] Vérification des réservations d'URL...
echo.
netsh http show urlacl | findstr "9597\|9598\|9599\|9600" >nul 2>&1
if !errorLevel! equ 0 (
    echo Réservations d'URL trouvées:
    netsh http show urlacl | findstr "9597\|9598\|9599\|9600"
) else (
    echo ✅ Aucune réservation d'URL sur ces ports
)
echo.

echo [5/6] Test de liaison directe...
echo.
for /L %%i in (9597,1,9600) do (
    echo Test de liaison sur port %%i...
    
    REM Créer un script PowerShell temporaire pour tester la liaison
    echo $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, %%i) > test_port.ps1
    echo try { >> test_port.ps1
    echo     $listener.Start() >> test_port.ps1
    echo     Write-Host "Port %%i: DISPONIBLE" >> test_port.ps1
    echo     $listener.Stop() >> test_port.ps1
    echo } catch { >> test_port.ps1
    echo     Write-Host "Port %%i: OCCUPÉ - $($_.Exception.Message)" >> test_port.ps1
    echo } >> test_port.ps1
    
    powershell -ExecutionPolicy Bypass -File test_port.ps1
    del test_port.ps1 >nul 2>&1
)
echo.

echo [6/6] Recommandations...
echo.
echo Si des ports sont occupés:
echo 1. Exécutez force-kill-ports.bat en tant qu'administrateur
echo 2. Redémarrez votre ordinateur si nécessaire
echo 3. Vérifiez qu'aucun autre service n'utilise ces ports
echo.
echo Si le problème persiste:
echo 1. Changez le port dans appsettings.json
echo 2. Ou utilisez un port dynamique (0)
echo.

pause