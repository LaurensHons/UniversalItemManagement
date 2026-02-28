using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.IntegrationTests.Infrastructure;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Middleware.Models;
using Xunit;
using Record = UniversalItemManagement.EF.Domain.Models.Entities.Record;

namespace UniversalItemManagement.IntegrationTests.Tests;

public class FieldControllerValidationTests : IntegrationTestBase
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public FieldControllerValidationTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Post_WithNonExistentRecordId_ReturnsBadRequest()
    {
        // Arrange - seed a FieldProperty but no matching Record
        var fieldPropertyId = Guid.NewGuid();
        await SeedTestData(context =>
        {
            context.Set<FieldProperty>().Add(new FieldProperty
            {
                Id = fieldPropertyId,
                Name = "Test Property",
                Type = FieldPropertyType.Text
            });
        });

        var dto = new FieldDto
        {
            Id = Guid.NewGuid(),
            RecordId = Guid.NewGuid(), // does not exist
            FieldPropertyId = fieldPropertyId,
            X = 0, Y = 0, Width = 3, Height = 1
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/Field", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<ErrorResponse>(content, JsonOptions);
        Assert.NotNull(error);
        Assert.Contains("Record", error.Message);
        Assert.Contains("does not exist", error.Message);
    }

    [Fact]
    public async Task Post_WithNonExistentFieldPropertyId_ReturnsBadRequest()
    {
        // Arrange - seed a Record but no matching FieldProperty
        var recordId = Guid.NewGuid();
        await SeedTestData(context =>
        {
            context.Set<Record>().Add(new Record
            {
                Id = recordId,
                Name = "Test Record",
                Description = "Test"
            });
        });

        var dto = new FieldDto
        {
            Id = Guid.NewGuid(),
            RecordId = recordId,
            FieldPropertyId = Guid.NewGuid(), // does not exist
            X = 0, Y = 0, Width = 3, Height = 1
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/Field", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<ErrorResponse>(content, JsonOptions);
        Assert.NotNull(error);
        Assert.Contains("FieldProperty", error.Message);
        Assert.Contains("does not exist", error.Message);
    }

    [Fact]
    public async Task Patch_WithNonExistentRecordId_ReturnsBadRequest()
    {
        // Arrange
        var fieldPropertyId = Guid.NewGuid();
        await SeedTestData(context =>
        {
            context.Set<FieldProperty>().Add(new FieldProperty
            {
                Id = fieldPropertyId,
                Name = "Test Property",
                Type = FieldPropertyType.Text
            });
        });

        var dto = new FieldDto
        {
            Id = Guid.NewGuid(),
            RecordId = Guid.NewGuid(), // does not exist
            FieldPropertyId = fieldPropertyId,
            X = 0, Y = 0, Width = 3, Height = 1
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Field", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Record", content);
        Assert.Contains("does not exist", content);
    }
}
