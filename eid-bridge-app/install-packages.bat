@echo off
echo ========================================
echo Installation des packages NuGet manquants
echo ========================================
echo.

echo [1/3] Ajout des packages d'authentification...
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 6.0.25
dotnet add package System.IdentityModel.Tokens.Jwt --version 7.1.2

echo [2/3] Ajout des packages Swagger...
dotnet add package Swashbuckle.AspNetCore --version 6.4.0

echo [3/3] Ajout des packages de service Windows...
dotnet add package Microsoft.Extensions.Hosting.WindowsServices --version 6.0.1
dotnet add package Microsoft.AspNetCore.Cors --version 2.2.0
dotnet add package Serilog.Extensions.Hosting --version 5.0.1
dotnet add package Serilog.Sinks.File --version 5.0.0
dotnet add package Serilog.Sinks.Console --version 4.1.0
dotnet add package System.Security.Cryptography.X509Certificates --version 4.3.2

echo.
echo ========================================
echo Installation terminée
echo ========================================
echo.
echo Vous pouvez maintenant compiler et exécuter l'application.
echo.
pause