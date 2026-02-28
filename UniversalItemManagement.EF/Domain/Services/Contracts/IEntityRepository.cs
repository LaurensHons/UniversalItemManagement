using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Models;

namespace UniversalItemManagement.EF.Domain.Services.Contracts
{
    public interface IEntityRepository<T> where T : Entity
    {
        
        Task<T?> FindByIdAsync(Guid id);
        Task<T?> FindByConditionAsync(Expression<Func<T, bool>> conditions);
        Task<List<T>> ListAsync();
        Task<List<T>> ListAsync(int pageIndex, int pageSize);
        Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions);
        Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions, int pageIndex, int pageSize);
        Task<bool> ExistsAsync(Guid id);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task DeleteByIdAsync(Guid id);
    }
}
