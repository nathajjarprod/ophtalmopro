@echo off
echo ========================================
echo eID Bridge - Demarrage
echo ========================================
echo.

echo [1/2] Verification des ports...
netstat -an | findstr ":5000" >nul 2>&1
if %errorLevel% equ 0 (
    echo Port 5000 deja utilise, tentative sur port alternatif...
    set ASPNETCORE_URLS=http://localhost:5500;https://localhost:5501
) else (
    echo Ports par defaut disponibles
)

echo [2/2] Demarrage de l'application...
echo.
echo ========================================
echo Application en cours de demarrage...
echo ========================================
echo.

dotnet run

pause