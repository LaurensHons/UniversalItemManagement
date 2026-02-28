using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using UniversalItemManagement.Server.Middleware.Models;
using Xunit;

namespace UniversalItemManagement.IntegrationTests.Middleware
{
    /// <summary>
    /// Integration tests for exception handling with real controllers
    /// </summary>
    public class ExceptionHandlingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public ExceptionHandlingIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task TestController_ThrowArgumentNull_ReturnsBadRequest()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-argument-null");

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
        }

        [Fact]
        public async Task TestController_ThrowNotFound_ReturnsNotFound()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-not-found");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("The requested resource was not found", errorResponse.Message);
        }

        [Fact]
        public async Task TestController_ThrowUnauthorized_ReturnsForbidden()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-unauthorized");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("Access to this resource is forbidden", errorResponse.Message);
        }

        [Fact]
        public async Task TestController_ThrowInvalidOperation_ReturnsBadRequest()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-invalid-operation");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("Test invalid operation", errorResponse.Message);
        }

        [Fact]
        public async Task TestController_ThrowUnhandled_ReturnsInternalServerError()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-unhandled");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("An internal server error occurred", errorResponse.Message);
        }

        [Fact]
        public async Task TestController_Success_ReturnsOk()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/success");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("Request succeeded", content);
        }

        [Fact]
        public async Task ErrorResponse_ContainsCorrectPath()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-argument-null");

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.Equal("/api/test/throw-argument-null", errorResponse.Path);
        }

        [Fact]
        public async Task ErrorResponse_ContainsTraceId()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/test/throw-argument-null");

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.NotNull(errorResponse.TraceId);
            Assert.NotEmpty(errorResponse.TraceId);
        }

        [Fact]
        public async Task ErrorResponse_ContainsTimestamp()
        {
            // Arrange
            var client = _factory.CreateClient();
            var beforeRequest = DateTime.UtcNow;

            // Act
            var response = await client.GetAsync("/api/test/throw-argument-null");
            var afterRequest = DateTime.UtcNow;

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(errorResponse);
            Assert.InRange(errorResponse.Timestamp, beforeRequest.AddSeconds(-5), afterRequest.AddSeconds(5));
        }
    }
}
