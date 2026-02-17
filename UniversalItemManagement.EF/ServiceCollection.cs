using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.EF.Domain.Services.Repositories;

namespace UniversalItemManagement.EF
{
    public static class ServiceCollection
    {
        public static IServiceCollection AddEntityFramework(this IServiceCollection services)
        {
            services.AddDbContext<Context>(o => {
                // Use PostgreSQL instead of SQL Server
                o.UseNpgsql(Environment.GetEnvironmentVariable("DB_CONNECTION_STRING"));
            }, ServiceLifetime.Transient);

            services.AddRepositories();

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IEntityRepository<Record>, RecordRepository>();
            services.AddTransient<IEntityRepository<FieldProperty>, FieldPropertyRepository>();
            services.AddTransient<IEntityRepository<Field>, FieldRepository>();
            services.AddTransient<IEntityRepository<FieldValue>, FieldValueRepository>();

            return services;
        }
    }
}
