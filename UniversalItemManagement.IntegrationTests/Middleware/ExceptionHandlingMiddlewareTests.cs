using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniversalItemManagement.Server.Middleware;
using UniversalItemManagement.Server.Middleware.Models;
using Xunit;

namespace UniversalItemManagement.IntegrationTests.Middleware
{
    public class ExceptionHandlingMiddlewareTests
    {
        [Fact]
        public async Task InvokeAsync_WhenNoExceptionThrown_PassesThrough()
        {
            // Arrange
            var host = await CreateTestHost(async context =>
            {
                context.Response.StatusCode = 200;
                await context.Response.WriteAsync("Success");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Equal("Success", content);
        }

        [Fact]
        public async Task InvokeAsync_WhenArgumentNullExceptionThrown_ReturnsBadRequest()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new ArgumentNullException("testParam", "Test parameter is null");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("A required parameter was null", errorResponse.Message);
            Assert.Equal(400, errorResponse.StatusCode);
            Assert.Equal("/test", errorResponse.Path);
            Assert.NotNull(errorResponse.TraceId);
        }

        [Fact]
        public async Task InvokeAsync_WhenArgumentExceptionThrown_ReturnsBadRequest()
        {
            // Arrange
            var exceptionMessage = "Invalid argument provided";
            var host = await CreateTestHost(context =>
            {
                throw new ArgumentException(exceptionMessage);
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal(exceptionMessage, errorResponse.Message);
        }

        [Fact]
        public async Task InvokeAsync_WhenInvalidOperationExceptionThrown_ReturnsBadRequest()
        {
            // Arrange
            var exceptionMessage = "Invalid operation";
            var host = await CreateTestHost(context =>
            {
                throw new InvalidOperationException(exceptionMessage);
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal(exceptionMessage, errorResponse.Message);
        }

        [Fact]
        public async Task InvokeAsync_WhenKeyNotFoundExceptionThrown_ReturnsNotFound()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new KeyNotFoundException("Entity not found");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("The requested resource was not found", errorResponse.Message);
            Assert.Equal(404, errorResponse.StatusCode);
        }

        [Fact]
        public async Task InvokeAsync_WhenUnauthorizedAccessExceptionThrown_ReturnsForbidden()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new UnauthorizedAccessException("Access denied");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("Access to this resource is forbidden", errorResponse.Message);
            Assert.Equal(403, errorResponse.StatusCode);
        }

        [Fact]
        public async Task InvokeAsync_WhenNotImplementedExceptionThrown_ReturnsNotImplemented()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new NotImplementedException("Feature not implemented");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.NotImplemented, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("This functionality is not yet implemented", errorResponse.Message);
        }

        [Fact]
        public async Task InvokeAsync_WhenTimeoutExceptionThrown_ReturnsRequestTimeout()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new TimeoutException("Request timed out");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.RequestTimeout, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("The request timed out", errorResponse.Message);
        }

        [Fact]
        public async Task InvokeAsync_WhenUnknownExceptionThrown_ReturnsInternalServerError()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new Exception("Unknown error");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("An internal server error occurred", errorResponse.Message);
            Assert.Equal(500, errorResponse.StatusCode);
        }

        [Fact]
        public async Task InvokeAsync_InDevelopmentEnvironment_IncludesExceptionDetails()
        {
            // Arrange
            var exceptionMessage = "Test exception with stack trace";
            var host = await CreateTestHost(
                context => throw new InvalidOperationException(exceptionMessage),
                environmentName: "Development");

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.NotNull(errorResponse.Details);
            Assert.Contains(exceptionMessage, errorResponse.Details);
        }

        [Fact]
        public async Task InvokeAsync_InProductionEnvironment_DoesNotIncludeExceptionDetails()
        {
            // Arrange
            var host = await CreateTestHost(
                context => throw new InvalidOperationException("Secret error details"),
                environmentName: "Production");

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Null(errorResponse.Details);
        }

        [Fact]
        public async Task InvokeAsync_SetsCorrectContentType()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new ArgumentException("Test");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        }

        [Fact]
        public async Task InvokeAsync_IncludesTimestamp()
        {
            // Arrange
            var beforeRequest = DateTime.UtcNow;
            var host = await CreateTestHost(context =>
            {
                throw new ArgumentException("Test");
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");
            var afterRequest = DateTime.UtcNow;

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.InRange(errorResponse.Timestamp, beforeRequest.AddSeconds(-1), afterRequest.AddSeconds(1));
        }

        [Fact]
        public async Task InvokeAsync_WhenDbUpdateExceptionThrown_ReturnsConflict()
        {
            // Arrange
            var host = await CreateTestHost(context =>
            {
                throw new DbUpdateException("An error occurred while saving changes",
                    new Exception("inner database error"));
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal(409, errorResponse.StatusCode);
            Assert.Contains("database conflict", errorResponse.Message);
        }

        [Fact]
        public async Task InvokeAsync_WhenForeignKeyValidationExceptionThrown_ReturnsBadRequest()
        {
            // Arrange - ForeignKeyValidationException extends ArgumentException → 400
            var invalidId = Guid.NewGuid();
            var host = await CreateTestHost(context =>
            {
                throw new ForeignKeyValidationException("Record", "RecordId", invalidId);
            });

            var client = host.GetTestClient();

            // Act
            var response = await client.GetAsync("/test");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Contains("Record", errorResponse.Message);
            Assert.Contains("does not exist", errorResponse.Message);
            Assert.Contains(invalidId.ToString(), errorResponse.Message);
        }

        private async Task<IHost> CreateTestHost(RequestDelegate requestDelegate, string environmentName = "Testing")
        {
            var hostBuilder = new HostBuilder()
                .ConfigureWebHost(webHost =>
                {
                    webHost.UseTestServer();
                    webHost.UseEnvironment(environmentName);
                    webHost.ConfigureServices(services =>
                    {
                        services.AddLogging();
                    });
                    webHost.Configure(app =>
                    {
                        app.UseExceptionHandling();
                        app.Run(requestDelegate);
                    });
                });

            var host = await hostBuilder.StartAsync();
            return host;
        }
    }
}
