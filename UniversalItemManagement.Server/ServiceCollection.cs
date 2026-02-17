using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Hubs;
using UniversalItemManagement.Server.Middleware;
using UniversalItemManagement.Server.Services;
using UniversalItemManagement.Server.Services.Contracts;
using UniversalItemManagement.Server.Configuration;

namespace UniversalItemManagement.Server
{
    public static  class ServiceCollection
    {

        
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddSignalR()
                .AddJsonProtocol(options =>
                {
                    JsonSerializationConfiguration.ConfigureJsonSerializerOptions(options.PayloadSerializerOptions);
                });
            services.AddTransient<EntityHub>();
            services.AddTransient<EntitySignalService>();
            services.AddScoped<HubConnectionService>();
            services.AddTransient<IEntityService<Record>, EntityUpdatedService<Record>>(
                (provider) =>
                    new EntityUpdatedService<Record>(
                        provider,
                        HubEnum.Record
                    )
                );
            services.AddTransient<IEntityService<Field>, EntityUpdatedService<Field>>(
                (provider) =>
                    new EntityUpdatedService<Field>(
                        provider,
                        HubEnum.Field
                    )
                );
            services.AddTransient<IEntityService<FieldProperty>, EntityUpdatedService<FieldProperty>>(
                (provider) =>
                    new EntityUpdatedService<FieldProperty>(
                        provider,
                        HubEnum.FieldProperty
                    )
                );
            services.AddTransient<IEntityService<FieldValue>, EntityUpdatedService<FieldValue>>(
                (provider) =>
                    new EntityUpdatedService<FieldValue>(
                        provider,
                        HubEnum.FieldValue
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
