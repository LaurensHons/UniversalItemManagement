namespace UniversalItemManagement.Server.Services.Contracts
{
    public interface IEntityService<T> where T : class
    {
        Task<T> FindByIdAsync(Guid id);
        Task<List<T>> ListAsync();
        Task<T> Add(T entity);
        Task<T> Update(T entity);
        Task Delete(T entity);
        Task DeleteById(Guid id);
    }
}
