using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.Server.Middleware.Models;

namespace UniversalItemManagement.Server.Middleware
{
    /// <summary>
    /// Middleware to handle exceptions globally and return standardized error responses
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var (statusCode, message) = GetStatusCodeAndMessage(exception);

            var response = new ErrorResponse
            {
                Message = message,
                StatusCode = (int)statusCode,
                Path = context.Request.Path,
                TraceId = context.TraceIdentifier
            };

            // Include stack trace and details only in development
            if (_environment.IsDevelopment())
            {
                response.Details = exception.ToString();
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }

        private (HttpStatusCode statusCode, string message) GetStatusCodeAndMessage(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException => (HttpStatusCode.BadRequest, "A required parameter was null"),
                ArgumentException => (HttpStatusCode.BadRequest, exception.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
                KeyNotFoundException => (HttpStatusCode.NotFound, "The requested resource was not found"),
                UnauthorizedAccessException => (HttpStatusCode.Forbidden, "Access to this resource is forbidden"),
                NotImplementedException => (HttpStatusCode.NotImplemented, "This functionality is not yet implemented"),
                TimeoutException => (HttpStatusCode.RequestTimeout, "The request timed out"),
                DbUpdateException dbEx => HandleDbUpdateException(dbEx),
                _ => (HttpStatusCode.InternalServerError, "An internal server error occurred")
            };
        }

        private (HttpStatusCode statusCode, string message) HandleDbUpdateException(DbUpdateException dbEx)
        {
            if (dbEx.InnerException is Npgsql.PostgresException pgEx)
            {
                return pgEx.SqlState switch
                {
                    // FK violation
                    "23503" => (HttpStatusCode.Conflict,
                        $"A referenced entity does not exist. {pgEx.Detail ?? pgEx.MessageText}"),
                    // Unique constraint violation
                    "23505" => (HttpStatusCode.Conflict,
                        $"A duplicate entry was detected. {pgEx.Detail ?? pgEx.MessageText}"),
                    _ => (HttpStatusCode.Conflict,
                        $"A database constraint was violated. {pgEx.MessageText}")
                };
            }

            return (HttpStatusCode.Conflict, "A database conflict occurred while saving changes");
        }
    }
}
