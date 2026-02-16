using System.Net;
using System.Net.Http.Json;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.IntegrationTests.Infrastructure;

namespace UniversalItemManagement.IntegrationTests.Tests;

public class RecordControllerTests : IntegrationTestBase
{
    public RecordControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Xunit.Fact]
    public async Task GetAll_ShouldReturnEmptyList_WhenNoRecordsExist()
    {
        // Act
        var response = await Client.GetAsync("/api/Record");

        // Assert
        response.EnsureSuccessStatusCode();
        var records = await response.Content.ReadFromJsonAsync<List<Record>>();
        Xunit.Assert.NotNull(records);
        Xunit.Assert.Empty(records);
    }

    [Xunit.Fact]
    public async Task GetAll_ShouldReturnRecords_WhenRecordsExist()
    {
        // Arrange
        await SeedTestData(context =>
        {
            context.Records.Add(new Record
            {
                Id = Guid.NewGuid(),
                Name = "Test Record",
                Description = "Test Description"
            });
        });

        // Act
        var response = await Client.GetAsync("/api/Record");

        // Assert
        response.EnsureSuccessStatusCode();
        var records = await response.Content.ReadFromJsonAsync<List<Record>>();
        Xunit.Assert.NotNull(records);
        Xunit.Assert.Single(records);
        Xunit.Assert.Equal("Test Record", records[0].Name);
    }
}