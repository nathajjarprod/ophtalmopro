@echo off
echo ========================================
echo Installation du certificat eID Bridge
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ATTENTION: Ce script devrait être exécuté en tant qu'administrateur
    echo pour une installation système complète.
    echo.
    echo Continuer quand même? (O/N)
    set /p continue=
    if /i not "%continue%"=="O" exit /b
)

echo Exécution du script PowerShell...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install-trusted-cert.ps1"

echo.
echo Si PowerShell a échoué, essayez d'exécuter install-trusted-cert.ps1 directement.
echo.
pause