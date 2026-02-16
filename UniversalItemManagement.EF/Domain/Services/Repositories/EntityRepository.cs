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

        protected virtual IQueryable<T> IncludeNavigationProperties(IQueryable<T> query)
        {
            return query;
        }

        public Task<T?> FindByConditionAsync(Expression<Func<T, bool>> conditions)
        {
            var query = context.Set<T>().AsNoTracking();
            query = IncludeNavigationProperties(query);
            return query.FirstOrDefaultAsync(conditions);
        }

        public Task<T?> FindByIdAsync(Guid id)
        {
            var query = context.Set<T>().AsNoTracking();
            query = IncludeNavigationProperties(query);
            return query.FirstOrDefaultAsync(e => e.Id == id);
        }

        public Task<List<T>> ListAsync()
        {
            return Task.Run(() =>
            {
                var query = context.Set<T>().AsNoTracking();
                query = IncludeNavigationProperties(query);
                return query.ToList();
            });
        }

        public Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions)
        {
            return Task.Run(() =>
            {
                var query = context.Set<T>().AsNoTracking();
                query = IncludeNavigationProperties(query);
                return query.Where(conditions).ToList();
            });
        }

        public Task<List<T>> ListAsync(int pageIndex, int pageSize)
        {
            return Task.Run(() =>
            {
                var query = context.Set<T>().AsNoTracking();
                query = IncludeNavigationProperties(query);
                return query
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
            });
        }
        public Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions, int pageIndex, int pageSize)
        {
            return Task.Run(() =>
            {
                var query = context.Set<T>().AsNoTracking();
                query = IncludeNavigationProperties(query);
                return query
                    .Where(conditions)
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
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
