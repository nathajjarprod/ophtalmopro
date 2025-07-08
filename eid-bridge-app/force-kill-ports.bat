@echo off
echo ========================================
echo Libération forcée des ports 8443-8450
echo ========================================
echo.

setlocal enabledelayedexpansion

echo [1/4] Arrêt de tous les processus .NET...
taskkill /F /IM "dotnet.exe" >nul 2>&1
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1
echo ✅ Processus .NET arrêtés

echo.
echo [2/4] Libération des ports spécifiques...

for /L %%i in (8443,1,8450) do (
    echo Libération du port %%i...
    
    REM Trouver le PID qui utilise le port
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%i "') do (
        if not "%%a"=="" (
            echo   └─ Arrêt du processus PID %%a
            taskkill /F /PID %%a >nul 2>&1
        )
    )
    
    REM Vérification
    netstat -an | findstr ":%%i " >nul 2>&1
    if !errorLevel! equ 0 (
        echo   ❌ Port %%i encore utilisé
    ) else (
        echo   ✅ Port %%i libéré
    )
)

echo.
echo [3/4] Arrêt du service Windows...
sc stop "OphtalmoPro eID Bridge" >nul 2>&1
sc delete "OphtalmoPro eID Bridge" >nul 2>&1
echo ✅ Service Windows nettoyé

echo.
echo [4/4] Nettoyage des processus orphelins...
REM Nettoyer tous les processus qui pourraient écouter sur ces ports
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq dotnet.exe" /FO CSV /NH') do (
    taskkill /F /PID %%i >nul 2>&1
)

echo ✅ Nettoyage terminé

echo.
echo ========================================
echo Tous les ports devraient être libres
echo ========================================
echo.

REM Vérification finale
echo Vérification finale des ports...
for /L %%i in (8443,1,8450) do (
    netstat -an | findstr ":%%i " >nul 2>&1
    if !errorLevel! equ 0 (
        echo ❌ Port %%i encore utilisé
    ) else (
        echo ✅ Port %%i libre
    )
)

echo.
echo Vous pouvez maintenant relancer l'application.
pause