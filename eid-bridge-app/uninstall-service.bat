@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Désinstallation
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

echo [1/4] Arrêt du service...

REM Arrêter le service
sc query "OphtalmoPro eID Bridge" >nul 2>&1
if %errorLevel% equ 0 (
    sc stop "OphtalmoPro eID Bridge"
    timeout /t 5 /nobreak >nul
    echo Service arrêté.
) else (
    echo Service non trouvé ou déjà arrêté.
)

echo [2/4] Suppression du service Windows...

REM Supprimer le service
sc delete "OphtalmoPro eID Bridge" >nul 2>&1
if %errorLevel% equ 0 (
    echo Service supprimé du registre Windows.
) else (
    echo Service déjà supprimé ou non trouvé.
)

echo [3/4] Suppression des règles de pare-feu...

REM Supprimer la règle de pare-feu
netsh advfirewall firewall delete rule name="OphtalmoPro eID Bridge" >nul 2>&1
echo Règles de pare-feu supprimées.

echo [4/4] Nettoyage des fichiers...

REM Demander confirmation pour supprimer les fichiers
echo.
set /p confirm="Supprimer tous les fichiers et données ? (O/N): "
if /i "%confirm%"=="O" (
    echo Suppression des fichiers...
    
    REM Supprimer les fichiers de programme
    if exist "C:\Program Files\OphtalmoPro\eID-Bridge" (
        rmdir /s /q "C:\Program Files\OphtalmoPro\eID-Bridge"
        echo Fichiers de programme supprimés.
    )
    
    REM Supprimer les données (logs, certificats, etc.)
    if exist "C:\ProgramData\OphtalmoPro\eID-Bridge" (
        rmdir /s /q "C:\ProgramData\OphtalmoPro\eID-Bridge"
        echo Données et logs supprimés.
    )
    
    REM Supprimer le répertoire parent s'il est vide
    if exist "C:\Program Files\OphtalmoPro" (
        rmdir "C:\Program Files\OphtalmoPro" >nul 2>&1
    )
    if exist "C:\ProgramData\OphtalmoPro" (
        rmdir "C:\ProgramData\OphtalmoPro" >nul 2>&1
    )
    
    echo.
    echo ========================================
    echo Désinstallation terminée !
    echo ========================================
    echo.
    echo Tous les composants ont été supprimés.
    echo Le middleware eID belge officiel n'a pas été touché.
    
) else (
    echo.
    echo ========================================
    echo Service désinstallé
    echo ========================================
    echo.
    echo Le service Windows a été supprimé mais les fichiers
    echo sont conservés dans:
    echo - C:\Program Files\OphtalmoPro\eID-Bridge\
    echo - C:\ProgramData\OphtalmoPro\eID-Bridge\
    echo.
    echo Vous pouvez les supprimer manuellement si nécessaire.
)

echo.
echo Appuyez sur une touche pour continuer...
pause >nul