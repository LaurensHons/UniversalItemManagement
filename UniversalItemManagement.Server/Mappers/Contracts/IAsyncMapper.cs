using System.Collections.Generic;
using System.Threading.Tasks;

namespace UniversalItemManagement.Server.Mappers.Contracts
{
    /// <summary>
    /// Defines a contract for asynchronous mapping from entity to DTO
    /// Useful when mapping requires database lookups or other async operations
    /// </summary>
    /// <typeparam name="TEntity">Source entity type</typeparam>
    /// <typeparam name="TDto">Destination DTO type</typeparam>
    public interface IAsyncMapper<TEntity, TDto>
    {
        /// <summary>
        /// Maps a single entity to a DTO asynchronously
        /// </summary>
        Task<TDto> MapAsync(TEntity entity);

        /// <summary>
        /// Maps a collection of entities to DTOs asynchronously
        /// </summary>
        Task<IEnumerable<TDto>> MapAsync(IEnumerable<TEntity> entities);
    }
}
