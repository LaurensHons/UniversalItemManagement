using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UniversalItemManagement.Server.Mappers.Contracts;

namespace UniversalItemManagement.Server.Mappers
{
    /// <summary>
    /// Base implementation of IAsyncMapper with default collection mapping
    /// </summary>
    public abstract class BaseAsyncMapper<TEntity, TDto> : IAsyncMapper<TEntity, TDto>
    {
        /// <summary>
        /// Maps a single entity to a DTO asynchronously. Must be implemented by derived classes.
        /// </summary>
        public abstract Task<TDto> MapAsync(TEntity entity);

        /// <summary>
        /// Maps a collection of entities to DTOs asynchronously
        /// </summary>
        public virtual async Task<IEnumerable<TDto>> MapAsync(IEnumerable<TEntity> entities)
        {
            if (entities == null)
                return Enumerable.Empty<TDto>();

            var tasks = entities.Select(MapAsync);
            return await Task.WhenAll(tasks);
        }
    }
}
