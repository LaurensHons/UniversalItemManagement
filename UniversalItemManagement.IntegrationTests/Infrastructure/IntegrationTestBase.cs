using Microsoft.Extensions.DependencyInjection;
using UniversalItemManagement.EF.Domain.Infrastructure;
using Xunit;

namespace UniversalItemManagement.IntegrationTests.Infrastructure;

public class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory<Program>>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory<Program> Factory;

    public IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected async Task<Context> GetDbContext()
    {
        var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<Context>();
        return context;
    }

    protected async Task SeedTestData(Action<Context> seedAction)
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<Context>();

        seedAction(context);
        await context.SaveChangesAsync();
    }
}