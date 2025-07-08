@echo off
echo ========================================
echo DIAGNOSTIC SYSTÈME COMPLET
echo ========================================
echo.

echo [1/8] Informations système...
echo OS: %OS%
echo Processeur: %PROCESSOR_ARCHITECTURE%
echo Utilisateur: %USERNAME%
echo Domaine: %USERDOMAIN%
echo.

echo [2/8] Vérification .NET...
dotnet --version 2>nul
if %errorLevel% neq 0 (
    echo ❌ .NET non trouvé ou non fonctionnel
    echo Téléchargez .NET 6.0 depuis: https://dotnet.microsoft.com/download/dotnet/6.0
) else (
    echo ✅ .NET disponible
)
echo.

echo [3/8] Processus en cours...
echo Processus dotnet:
tasklist | findstr dotnet.exe
echo.
echo Processus OphtalmoPro:
tasklist | findstr OphtalmoPro
echo.

echo [4/8] Ports réseau utilisés...
echo Ports 9590-9610:
netstat -an | findstr ":959"
netstat -an | findstr ":960"
echo.

echo [5/8] Services Windows...
echo Services Smart Card:
sc query SCardSvr 2>nul | findstr STATE
sc query ScDeviceEnum 2>nul | findstr STATE
echo.

echo [6/8] Pare-feu Windows...
echo Règles pour port 9597:
netsh advfirewall firewall show rule name=all | findstr 9597
echo.

echo [7/8] Réservations d'URL...
echo Réservations HTTP:
netsh http show urlacl | findstr 9597
echo.

echo [8/8] Variables d'environnement...
echo PATH contient .NET:
echo %PATH% | findstr dotnet
echo.
echo ASPNETCORE_ENVIRONMENT: %ASPNETCORE_ENVIRONMENT%
echo DOTNET_ENVIRONMENT: %DOTNET_ENVIRONMENT%
echo.

echo ========================================
echo DIAGNOSTIC TERMINÉ
echo ========================================
echo.
echo Analysez les résultats ci-dessus pour identifier le problème.
echo.
pause