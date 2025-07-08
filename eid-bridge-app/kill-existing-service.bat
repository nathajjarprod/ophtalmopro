@echo off
echo ========================================
echo Arrêt des instances existantes
echo ========================================
echo.

echo [1/3] Recherche des processus OphtalmoPro eID Bridge...

REM Tuer tous les processus OphtalmoPro.EidBridge
taskkill /F /IM "OphtalmoPro.EidBridge.exe" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Processus OphtalmoPro.EidBridge.exe arrêtés
) else (
    echo ℹ️ Aucun processus OphtalmoPro.EidBridge.exe en cours
)

echo [2/3] Vérification des ports utilisés...

REM Vérifier quels processus utilisent les ports 8443-8450
for /L %%i in (8443,1,8450) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%i') do (
        if not "%%a"=="" (
            echo Port %%i utilisé par PID %%a
            taskkill /F /PID %%a >nul 2>&1
            if !errorLevel! equ 0 (
                echo ✅ Processus PID %%a arrêté
            )
        )
    )
)

echo [3/3] Arrêt du service Windows...

REM Arrêter le service s'il existe
sc query "OphtalmoPro eID Bridge" >nul 2>&1
if %errorLevel% equ 0 (
    sc stop "OphtalmoPro eID Bridge" >nul 2>&1
    if %errorLevel% equ 0 (
        echo ✅ Service Windows arrêté
    ) else (
        echo ℹ️ Service Windows déjà arrêté
    )
) else (
    echo ℹ️ Service Windows non installé
)

echo.
echo ========================================
echo Nettoyage terminé
echo ========================================
echo.
echo Vous pouvez maintenant relancer l'application.
echo.
pause