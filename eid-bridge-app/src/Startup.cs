using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using OphtalmoPro.EidBridge.Services;
using OphtalmoPro.EidBridge.Middleware;
using System.Text.Json;

namespace OphtalmoPro.EidBridge
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // Configuration JSON avec options personnalisées
            services.Configure<JsonSerializerOptions>(options =>
            {
                options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                options.WriteIndented = true;
            });

            // Services principaux
            services.AddControllers();
            services.AddHttpsRedirection(options =>
            {
                options.HttpsPort = 8443;
            });

            // Services métier
            services.AddSingleton<IEidMiddlewareService, EidMiddlewareService>();
            services.AddSingleton<ICardReaderService, CardReaderService>();
            services.AddSingleton<ISecurityService, SecurityService>();
            services.AddSingleton<IAuditService, AuditService>();
            services.AddScoped<IEidDataService, EidDataService>();

            // Configuration CORS restrictive
            services.AddCors(options =>
            {
                options.AddPolicy("LocalhostOnly", builder =>
                {
                    builder
                        .WithOrigins(
                            "https://localhost:5173",
                            "https://localhost:3000",
                            "https://127.0.0.1:5173",
                            "https://127.0.0.1:3000"
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });

            // Documentation API Swagger (développement uniquement)
            if (Configuration.GetValue<bool>("EnableSwagger", false))
            {
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "OphtalmoPro eID Bridge API",
                        Version = "v1.0",
                        Description = "API sécurisée pour la lecture de cartes eID belges"
                    });
                    
                    // Configuration sécurité JWT
                    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                    {
                        Description = "JWT Authorization header using the Bearer scheme",
                        Name = "Authorization",
                        In = ParameterLocation.Header,
                        Type = SecuritySchemeType.ApiKey,
                        Scheme = "Bearer"
                    });
                });
            }

            // Service de santé pour monitoring
            services.AddHealthChecks()
                .AddCheck<EidMiddlewareHealthCheck>("eid-middleware")
                .AddCheck<CardReaderHealthCheck>("card-readers");

            // Configuration logging avancé
            services.AddLogging(builder =>
            {
                builder.AddFilter("Microsoft", LogLevel.Warning);
                builder.AddFilter("System", LogLevel.Warning);
                builder.AddFilter("OphtalmoPro.EidBridge", LogLevel.Information);
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                
                if (Configuration.GetValue<bool>("EnableSwagger", false))
                {
                    app.UseSwagger();
                    app.UseSwaggerUI(c =>
                    {
                        c.SwaggerEndpoint("/swagger/v1/swagger.json", "eID Bridge API v1");
                        c.RoutePrefix = "api-docs";
                    });
                }
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            // Middleware personnalisés
            app.UseMiddleware<SecurityHeadersMiddleware>();
            app.UseMiddleware<RequestLoggingMiddleware>();
            app.UseMiddleware<RateLimitingMiddleware>();

            // Configuration standard
            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("LocalhostOnly");
            
            // Authentification JWT
            app.UseAuthentication();
            app.UseAuthorization();

            // Health checks
            app.UseHealthChecks("/health");

            // Routes API
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health/detailed").RequireAuthorization();
            });

            // Page d'accueil simple
            app.Run(async context =>
            {
                if (context.Request.Path == "/")
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.WriteAsync(@"
<!DOCTYPE html>
<html>
<head>
    <title>OphtalmoPro eID Bridge</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
    </style>
</head>
<body>
    <h1>🏥 OphtalmoPro eID Bridge</h1>
    <div class='status success'>
        ✅ Service opérationnel
    </div>
    <div class='status info'>
        📡 API disponible sur : <strong>https://localhost:8443/api/</strong><br>
        📊 Santé du service : <a href='/health'>Vérifier</a><br>
        📚 Documentation : <a href='/api-docs'>API Docs</a>
    </div>
    <p><strong>Version :</strong> 1.0.0</p>
    <p><strong>Démarré :</strong> " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"</p>
</body>
</html>");
                }
            });
        }
    }
}