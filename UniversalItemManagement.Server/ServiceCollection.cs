using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Hubs;
using UniversalItemManagement.Server.Mappers;
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

            // Mappers (used by controllers to transform entities to DTOs)
            services.AddTransient<FieldMapper>();
            services.AddTransient<FieldPropertyMapper>();
            services.AddTransient<RecordMapper>();
            services.AddTransient<ItemListMapper>();
            services.AddTransient<ListItemMapper>();

            // Domain services
            services.AddScoped<FieldValueService>();
            services.AddScoped<FieldValidationService>();

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
            services.AddTransient<IEntityService<ItemList>, EntityUpdatedService<ItemList>>(
                (provider) =>
                    new EntityUpdatedService<ItemList>(
                        provider,
                        HubEnum.ItemList
                    )
                );
            services.AddTransient<IEntityService<ListItem>, EntityUpdatedService<ListItem>>(
                (provider) =>
                    new EntityUpdatedService<ListItem>(
                        provider,
                        HubEnum.ListItem
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
