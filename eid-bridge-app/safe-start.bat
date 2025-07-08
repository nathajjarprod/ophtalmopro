@echo off
echo ========================================
echo Démarrage sécurisé - OphtalmoPro eID Bridge
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️ Ce script doit être exécuté en tant qu'administrateur pour un nettoyage optimal.
    echo Clic droit sur le fichier et sélectionnez "Exécuter en tant qu'administrateur"
    echo.
    echo Continuer quand même? (O/N)
    set /p continue=
    if /i not "%continue%"=="O" exit /b
)

echo [1/5] Nettoyage préventif...
call force-kill-ports.bat

echo.
echo [2/5] Attente de stabilisation...
timeout /t 3 /nobreak >nul

echo.
echo [3/5] Vérification des prérequis...

REM Vérifier .NET
dotnet --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ .NET n'est pas installé ou accessible
    echo Téléchargez .NET 6.0 depuis: https://dotnet.microsoft.com/download/dotnet/6.0
    pause
    exit /b 1
)

echo ✅ .NET disponible

REM Vérifier le projet
if not exist "OphtalmoPro.EidBridge.csproj" (
    echo ❌ Fichier projet non trouvé
    echo Assurez-vous d'être dans le bon répertoire
    pause
    exit /b 1
)

echo ✅ Projet trouvé

echo.
echo [4/5] Compilation...
dotnet build --configuration Release >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Erreur de compilation
    echo Détails:
    dotnet build --configuration Release
    pause
    exit /b 1
)

echo ✅ Compilation réussie

echo.
echo [5/5] Démarrage de l'application...
echo.
echo ========================================
echo Application en cours de démarrage...
echo ========================================
echo.

REM Démarrer avec gestion d'erreur
dotnet run --configuration Release
set exitCode=%errorLevel%

echo.
echo ========================================
if %exitCode% equ 0 (
    echo ✅ Application fermée normalement
) else (
    echo ❌ Application fermée avec erreur (code: %exitCode%)
    echo.
    echo Solutions possibles:
    echo 1. Exécuter nuclear-cleanup.bat
    echo 2. Redémarrer l'ordinateur
    echo 3. Changer le port dans appsettings.json
)
echo ========================================

pause