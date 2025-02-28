using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Hubs;
using UniversalItemManagement.Server.Middleware;
using UniversalItemManagement.Server.Services;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server
{
    public static  class ServiceCollection
    {

        
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddSignalR();
            services.AddTransient<EntityHub>();
            services.AddScoped<HubConnectionService>();
            services.AddTransient<IEntityService<Record>, EntityUpdatedService<Record>>(
                (provider) =>
                    new EntityUpdatedService<Record>(
                        provider,
                        HubEnum.Record
                    )
                );

            return services;
        }

        public static IApplicationBuilder BuildApplication(this IApplicationBuilder builder)
        {
            return builder;
        }

        public static IEndpointRouteBuilder BuildEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapHub<EntityHub>("/Hub", options =>
                {
                    options.Transports = HttpTransportType.WebSockets | HttpTransportType.LongPolling;
                }
              );
            return app;
        }

    }
}
