using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using UniversalItemManagement.EF;
using UniversalItemManagement.EF.Domain.Infrastructure;

namespace UniversalItemManagement.IntegrationTests.Infrastructure;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set environment to Testing FIRST so Program.cs can skip AddEntityFramework
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Add DbContext using in-memory database for testing
            services.AddDbContext<Context>(options =>
            {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
            }, ServiceLifetime.Transient);

            // Add repositories
            services.AddRepositories();
        });
    }
}