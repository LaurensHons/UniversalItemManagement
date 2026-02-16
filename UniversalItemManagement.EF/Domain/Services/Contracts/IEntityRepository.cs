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
        Task<T> Add(T entity);
        Task<T> Update(T entity);
        Task Delete(T entity);
        Task DeleteById(Guid id);
    }
}
