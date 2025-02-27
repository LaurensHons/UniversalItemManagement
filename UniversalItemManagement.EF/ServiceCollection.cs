using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.EF.Domain.Services.Repositories;

namespace UniversalItemManagement.EF
{
    public static class ServiceCollection
    {
        public static IServiceCollection AddEntityFramework(this IServiceCollection services)
        {
            services.AddDbContext<Context>(o => {
                o.UseSqlServer(Environment.GetEnvironmentVariable("DB_CONNECTION_STRING"));
            }, ServiceLifetime.Transient);

            services.AddTransient<IEntityRepository<Record>, EntityRepository<Record>>();

            return services;
        }
    }
}
