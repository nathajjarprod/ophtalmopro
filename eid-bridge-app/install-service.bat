@echo off
echo ========================================
echo OphtalmoPro eID Bridge - Installation
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

echo [1/6] Vérification des prérequis...

REM Vérifier .NET 6.0
dotnet --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: .NET 6.0 Runtime n'est pas installé.
    echo Téléchargez-le depuis: https://dotnet.microsoft.com/download/dotnet/6.0
    pause
    exit /b 1
)

echo [2/6] Création des répertoires...

REM Créer les répertoires nécessaires
if not exist "C:\Program Files\OphtalmoPro" mkdir "C:\Program Files\OphtalmoPro"
if not exist "C:\Program Files\OphtalmoPro\eID-Bridge" mkdir "C:\Program Files\OphtalmoPro\eID-Bridge"
if not exist "C:\ProgramData\OphtalmoPro" mkdir "C:\ProgramData\OphtalmoPro"
if not exist "C:\ProgramData\OphtalmoPro\eID-Bridge" mkdir "C:\ProgramData\OphtalmoPro\eID-Bridge"
if not exist "C:\ProgramData\OphtalmoPro\eID-Bridge\Logs" mkdir "C:\ProgramData\OphtalmoPro\eID-Bridge\Logs"
if not exist "C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates" mkdir "C:\ProgramData\OphtalmoPro\eID-Bridge\Certificates"

echo [3/6] Copie des fichiers...

REM Copier les fichiers de l'application
xcopy /Y /E "src\*" "C:\Program Files\OphtalmoPro\eID-Bridge\"

echo [4/6] Configuration du service Windows...

REM Arrêter le service s'il existe déjà
sc query "OphtalmoPro eID Bridge" >nul 2>&1
if %errorLevel% equ 0 (
    echo Service existant détecté, arrêt en cours...
    sc stop "OphtalmoPro eID Bridge"
    timeout /t 5 /nobreak >nul
    sc delete "OphtalmoPro eID Bridge"
    timeout /t 2 /nobreak >nul
)

REM Créer le service Windows
sc create "OphtalmoPro eID Bridge" ^
    binPath= "\"C:\Program Files\OphtalmoPro\eID-Bridge\OphtalmoPro.EidBridge.exe\"" ^
    start= auto ^
    DisplayName= "OphtalmoPro eID Bridge Service" ^
    description= "Service de lecture sécurisée des cartes eID belges pour OphtalmoPro"

if %errorLevel% neq 0 (
    echo ERREUR: Impossible de créer le service Windows.
    pause
    exit /b 1
)

echo [5/6] Configuration de la sécurité...

REM Configurer les permissions
icacls "C:\Program Files\OphtalmoPro\eID-Bridge" /grant "NT AUTHORITY\LOCAL SERVICE:(OI)(CI)R" /T
icacls "C:\ProgramData\OphtalmoPro\eID-Bridge" /grant "NT AUTHORITY\LOCAL SERVICE:(OI)(CI)F" /T

REM Configurer le pare-feu Windows
netsh advfirewall firewall delete rule name="OphtalmoPro eID Bridge" >nul 2>&1
netsh advfirewall firewall add rule ^
    name="OphtalmoPro eID Bridge" ^
    dir=in ^
    action=allow ^
    protocol=TCP ^
    localport=9597 ^
    profile=private,domain ^
    description="API HTTPS pour OphtalmoPro eID Bridge"

echo [6/6] Démarrage du service...

REM Démarrer le service
sc start "OphtalmoPro eID Bridge"

if %errorLevel% neq 0 (
    echo ATTENTION: Le service a été créé mais n'a pas pu démarrer.
    echo Vérifiez les logs dans: C:\ProgramData\OphtalmoPro\eID-Bridge\Logs\
) else (
    echo.
    echo ========================================
    echo Installation terminée avec succès !
    echo ========================================
    echo.
    echo Service: OphtalmoPro eID Bridge
    echo Statut: Démarré
    echo API: https://localhost:8443/
    echo API: https://localhost:9597/
    echo Logs: C:\ProgramData\OphtalmoPro\eID-Bridge\Logs\
    echo.
    echo Test de connectivité...
    timeout /t 3 /nobreak >nul
    
    REM Test de connectivité
    curl -k https://localhost:9597/api/status >nul 2>&1
    if %errorLevel% equ 0 (
        echo ✅ Service opérationnel !
        echo.
        echo Vous pouvez maintenant utiliser l'application web OphtalmoPro
        echo avec la lecture automatique des cartes eID.
    ) else (
        echo ⚠️ Service démarré mais API non accessible.
        echo Vérifiez les logs pour plus de détails.
    )
)

echo.
echo Appuyez sur une touche pour continuer...
pause >nul