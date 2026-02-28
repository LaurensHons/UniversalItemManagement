namespace UniversalItemManagement.Server.Middleware
{
    /// <summary>
    /// Extension methods for registering middleware
    /// </summary>
    public static class MiddlewareExtensions
    {
        /// <summary>
        /// Adds global exception handling middleware to the pipeline
        /// </summary>
        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
