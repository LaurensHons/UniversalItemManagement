# UniversalItemManagement.IntegrationTests

This project contains integration tests for the UniversalItemManagement application.

## Structure

- **Infrastructure/**
  - `CustomWebApplicationFactory.cs` - Configures the test server with in-memory database
  - `IntegrationTestBase.cs` - Base class for all integration tests with common utilities

- **Tests/**
  - Contains actual test classes organized by controller/feature

## Running Tests

Run all tests:
```bash
dotnet test
```

Run tests in a specific class:
```bash
dotnet test --filter "FullyQualifiedName~RecordControllerTests"
```

Run a specific test:
```bash
dotnet test --filter "FullyQualifiedName~RecordControllerTests.GetAll_ShouldReturnEmptyList_WhenNoRecordsExist"
```

## Writing Tests

All integration test classes should inherit from `IntegrationTestBase`:

```csharp
public class MyControllerTests : IntegrationTestBase
{
    public MyControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task MyTest()
    {
        // Arrange - seed test data
        await SeedTestData(context =>
        {
            context.Records.Add(new Record { Name = "Test" });
        });

        // Act - make HTTP request
        var response = await Client.GetAsync("/api/MyController");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<MyModel>();
        Assert.NotNull(result);
    }
}
```

## Features

- Uses in-memory database for fast, isolated tests
- Automatically cleans up database between test runs
- Full ASP.NET Core integration testing with `WebApplicationFactory`
- Access to HttpClient for API testing
- Helper methods for seeding test data
