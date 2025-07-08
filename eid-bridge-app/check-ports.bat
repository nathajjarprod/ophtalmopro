@echo off
echo ========================================
echo Vérification des ports OphtalmoPro eID Bridge
echo ========================================
echo.

echo [1/2] Ports en écoute sur localhost...
echo.

for /L %%i in (9597,1,9604) do (
    echo Vérification du port %%i...
    netstat -an | findstr ":%%i " >nul 2>&1
    if !errorLevel! equ 0 (
        echo ❌ Port %%i UTILISÉ
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%i') do (
            if not "%%a"=="" (
                echo    └─ PID: %%a
                for /f "tokens=1" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH') do (
                    echo    └─ Processus: %%b
                )
            )
        )
    ) else (
        echo ✅ Port %%i libre
    )
    echo.
)

echo [2/2] Test de connectivité API...
echo.

for /L %%i in (9597,1,9604) do (
    echo Test HTTPS sur port %%i...
    curl -k -s --connect-timeout 2 https://localhost:%%i/api/status >nul 2>&1
    if !errorLevel! equ 0 (
        echo ✅ API OphtalmoPro eID Bridge active sur port %%i
        curl -k -s https://localhost:%%i/api/status
        echo.
    ) else (
        echo ❌ Aucune API sur port %%i
    )
    echo.
)

echo ========================================
echo Vérification terminée
echo ========================================
echo.
pause