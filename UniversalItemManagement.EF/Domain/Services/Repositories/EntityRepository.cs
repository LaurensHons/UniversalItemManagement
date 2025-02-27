using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Services.Contracts;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class EntityRepository<T> : IEntityRepository<T> where T : Entity
    {
        protected readonly Context context;

        public EntityRepository(Context c)
        {
            context = c;
        }

        public EntityRepository()
        {
        }

        public Task<T> FindByConditionAsync(Expression<Func<T, bool>> conditions)
        {
            return context.Set<T>().AsNoTracking().FirstAsync(conditions);
        }

        public Task<T> FindByIdAsync(Guid id)
        {
            return context.Set<T>().AsNoTracking().FirstAsync(e => e.Id == id);
        }

        public Task<List<T>> ListAsync()
        {
            return Task.Run(() =>
            {
                return context.Set<T>()
                    .AsNoTracking()
                    .ToList();
            });
        }

        public Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions)
        {
            return Task.Run(() =>
            {
                return context.Set<T>()
                    .Where(conditions)
                    .AsNoTracking()
                    .ToList();
            });
        }

        public Task<List<T>> ListAsync(int pageIndex, int pageSize)
        {
            return Task.Run(() =>
            {
                return context.Set<T>()
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ToList();
            });
        }
        public Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions, int pageIndex, int pageSize)
        {
            return Task.Run(() =>
            {
                return context.Set<T>()
                    .Where(conditions)
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ToList();
            });
        }
        public async Task<T> Add(T entity)
        {
            context.Add<T>(entity);
            await context.SaveChangesAsync();
            return entity;
        }

        public async Task<T> Update(T entity)
        {
            context.Update<T>(entity);
            await context.SaveChangesAsync();
            return entity;
        }


        public async Task Delete(T entity)
        {
            context.Remove<T>(entity);
            await context.SaveChangesAsync();
        }

        public async Task DeleteById(Guid id)
        {
            var entityToRemove = context.Set<T>().First(e => e.Id == id);
            context.Remove(entityToRemove);
            await context.SaveChangesAsync();
        }
    }
}
