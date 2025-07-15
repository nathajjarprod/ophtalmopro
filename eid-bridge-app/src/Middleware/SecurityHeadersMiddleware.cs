namespace OphtalmoPro.EidBridge.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;

        public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

      public async Task InvokeAsync(HttpContext context)
        {
          context.Response.Headers["X-Content-Type-Options"] = "nosniff";
          context.Response.Headers.Append("X-Frame-Options", "DENY");
          context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
          context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
          context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

        context.Response.Headers.Remove("Server");
         context.Response.Headers.Remove("X-Powered-By");

          await _next(context);
        }
    }
}