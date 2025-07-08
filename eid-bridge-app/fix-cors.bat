@echo off
echo ========================================
echo Correction des problèmes CORS - eID Bridge
echo ========================================
echo.

echo [1/3] Vérification de l'application...
curl -k -s https://localhost:8443/api/status >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Application non accessible
    echo Démarrez d'abord l'application avec start-dev.bat
    pause
    exit /b 1
)
echo ✅ Application accessible

echo.
echo [2/3] Test des headers CORS...
echo.

REM Tester les headers CORS avec curl
echo Test OPTIONS avec curl...
curl -k -i -X OPTIONS -H "Origin: https://localhost:5173" -H "Access-Control-Request-Method: GET" https://localhost:8443/api/status

echo.
echo.
echo Test GET avec curl...
curl -k -i -H "Origin: https://localhost:5173" https://localhost:8443/api/status | findstr "Access-Control-Allow"

echo.
echo.
echo [3/3] Instructions pour corriger CORS...
echo.
echo ========================================
echo SOLUTIONS CORS
echo ========================================
echo.
echo 1. VÉRIFIEZ LA CONFIGURATION CORS DANS STARTUP.CS:
echo.
echo    services.AddCors(options =>
echo    {
echo        options.AddPolicy("LocalhostOnly", builder =>
echo        {
echo            builder
echo                .WithOrigins(
echo                    "https://localhost:5173",
echo                    "https://localhost:3000",
echo                    "https://127.0.0.1:5173",
echo                    "https://127.0.0.1:3000",
echo                    "https://localhost:8443",
echo                    "https://127.0.0.1:8443"
echo                )
echo                .AllowAnyMethod()
echo                .AllowAnyHeader()
echo                .AllowCredentials()
echo                .SetIsOriginAllowedToAllowWildcardSubdomains();
echo        });
echo    });
echo.
echo 2. ASSUREZ-VOUS QUE LE MIDDLEWARE CORS EST ACTIVÉ:
echo.
echo    app.UseCors("LocalhostOnly");
echo.
echo 3. TESTEZ AVEC LA PAGE CORS-TEST.HTML
echo.
echo 4. POUR LES TESTS, VOUS POUVEZ AUSSI UTILISER UNE EXTENSION NAVIGATEUR:
echo    - "CORS Unblock" pour Chrome
echo    - "CORS Everywhere" pour Firefox
echo.
echo ========================================
echo.
pause