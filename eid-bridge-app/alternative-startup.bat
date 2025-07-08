@echo off
echo ========================================
echo MÉTHODES DE DÉMARRAGE ALTERNATIVES
echo ========================================
echo.

echo Quelle méthode voulez-vous essayer?
echo.
echo 1. Démarrage avec IIS Express
echo 2. Démarrage en mode console simple
echo 3. Démarrage avec port dynamique
echo 4. Démarrage en mode développement
echo 5. Démarrage avec Kestrel minimal
echo.
set /p choice="Votre choix (1-5): "

if "%choice%"=="1" goto iis_express
if "%choice%"=="2" goto console_simple
if "%choice%"=="3" goto dynamic_port
if "%choice%"=="4" goto dev_mode
if "%choice%"=="5" goto kestrel_minimal

:iis_express
echo.
echo === DÉMARRAGE AVEC IIS EXPRESS ===
echo.
echo Création du fichier web.config...
echo ^<?xml version="1.0" encoding="utf-8"?^> > web.config
echo ^<configuration^> >> web.config
echo   ^<system.webServer^> >> web.config
echo     ^<handlers^> >> web.config
echo       ^<add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModule" resourceType="Unspecified" /^> >> web.config
echo     ^</handlers^> >> web.config
echo     ^<aspNetCore processPath="dotnet" arguments="OphtalmoPro.EidBridge.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" /^> >> web.config
echo   ^</system.webServer^> >> web.config
echo ^</configuration^> >> web.config

echo Configuration IIS Express créée
echo Lancez manuellement avec IIS Express Manager
pause
goto end

:console_simple
echo.
echo === DÉMARRAGE CONSOLE SIMPLE ===
echo.
echo Démarrage sans configuration complexe...
set ASPNETCORE_ENVIRONMENT=Development
set ASPNETCORE_URLS=http://localhost:5000
dotnet run --no-build
goto end

:dynamic_port
echo.
echo === DÉMARRAGE PORT DYNAMIQUE ===
echo.
echo Configuration port dynamique...
set ASPNETCORE_URLS=http://localhost:0;https://localhost:0
dotnet run --no-build
goto end

:dev_mode
echo.
echo === MODE DÉVELOPPEMENT ===
echo.
echo Démarrage en mode développement complet...
set ASPNETCORE_ENVIRONMENT=Development
set DOTNET_ENVIRONMENT=Development
set ASPNETCORE_URLS=http://localhost:5000
dotnet run --configuration Debug
goto end

:kestrel_minimal
echo.
echo === KESTREL MINIMAL ===
echo.
echo Création d'une configuration minimale...
echo using Microsoft.AspNetCore.Hosting; > minimal.cs
echo using Microsoft.Extensions.Hosting; >> minimal.cs
echo. >> minimal.cs
echo var builder = WebApplication.CreateBuilder(args); >> minimal.cs
echo var app = builder.Build(); >> minimal.cs
echo. >> minimal.cs
echo app.MapGet("/", () =^> "OphtalmoPro eID Bridge - Minimal"); >> minimal.cs
echo. >> minimal.cs
echo app.Run("http://localhost:5000"); >> minimal.cs

echo Compilation et démarrage minimal...
dotnet run minimal.cs
goto end

:end
echo.
echo Démarrage terminé.
pause