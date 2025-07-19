using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using OphtalmoPro.EidBridge.Services;
using OphtalmoPro.EidBridge.Middleware;
using OphtalmoPro.EidBridge.HealthChecks;
using System.Text.Json;

namespace OphtalmoPro.EidBridge
{
    public class Startup
    {
        public Startup(IConfiguration configuration) => Configuration = configuration;
        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // JSON config
            services.Configure<JsonSerializerOptions>(options =>
            {
                options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                options.WriteIndented = true;
            });

            // API controllers
            services.AddControllers();

            // CORS: pour localhost uniquement
            services.AddCors(options =>
            {
                options.AddPolicy("LocalhostOnly", builder =>
                {
                    builder.WithOrigins(
                        "https://localhost:5173",
                        "https://localhost:3000",
                        "https://127.0.0.1:5173",
                        "https://127.0.0.1:3000",
                        "https://localhost:8443",
                        "https://127.0.0.1:8443"
                    )
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
                });
            });

            // Services eID
            services.AddScoped<IEidMiddlewareService, EidMiddlewareService>();
            services.AddSingleton<ICardReaderService, CardReaderService>();
            services.AddSingleton<ISecurityService, SecurityService>();
            services.AddSingleton<IAuditService, AuditService>();
            services.AddScoped<IEidDataService, EidDataService>();

            // Swagger (si activé)
            if (Configuration.GetValue<bool>("EnableSwagger", false))
            {
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "OphtalmoPro eID Bridge API",
                        Version = "v1.0"
                    });
                });
            }

            // Health checks
            services.AddHealthChecks()
                .AddCheck<EidMiddlewareHealthCheck>("eid-middleware")
                .AddCheck<CardReaderHealthCheck>("card-readers");
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

            // Sécurité, logs, et limitations
            app.UseMiddleware<SecurityHeadersMiddleware>();
            app.UseMiddleware<RequestLoggingMiddleware>();
            app.UseMiddleware<RateLimitingMiddleware>();

            app.UseHttpsRedirection();

            // 🔐 CORS
            app.UseCors("LocalhostOnly");
            app.UseMiddleware<DynamicHtmlWithNonceMiddleware>();
            // 📁 Fichiers statiques (pour /eid-test-swelio.html, etc.)
            app.UseStaticFiles();

            // Routing
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            // Health check
            app.UseHealthChecks("/health");

            // Routes API
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health/detailed").RequireAuthorization();
            });

            // Page d'accueil ("/")
           app.Run(async context =>
{
    if (context.Request.Path == "/")
    {
        context.Response.ContentType = "text/html";

        var port = context.Request.Host.Port ?? int.Parse(Environment.GetEnvironmentVariable("SELECTED_PORT") ?? "8443");

        // Récupère le nonce généré par le middleware CSP
        var nonce = context.Items["CSPNonce"] as string ?? "";

        await context.Response.WriteAsync($@"
<!DOCTYPE html>
<html>
<head>
    <title>OphtalmoPro eID Bridge</title>
    <style nonce=""{nonce}"">
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .status {{ padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .success {{ background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }}
        .info {{ background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }}
    </style>
</head>
<body>
    <h1>🏥 OphtalmoPro eID Bridge</h1>
    <div class='status success'>
        ✅ Service opérationnel
    </div>
    <div class='status info'>
        📡 API disponible sur : <strong>https://localhost:{port}/api/</strong><br>
        📊 Santé du service : <a href='/health'>Vérifier</a><br>
        📚 Documentation : <a href='/api-docs'>API Docs</a>
    </div>
    <p><strong>Version :</strong> 1.0.0</p>
    <p><strong>Démarré :</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
    <p><strong>Port :</strong> {port}</p>

    <script nonce=""{nonce}"">
        console.log('eID Bridge en ligne sur le port {port}');
    </script>
</body>
</html>");
    }
});
        }
    }
}
