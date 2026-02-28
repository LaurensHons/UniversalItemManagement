using System.Collections.Generic;
using System.Linq;
using UniversalItemManagement.Server.Mappers.Contracts;

namespace UniversalItemManagement.Server.Mappers
{
    /// <summary>
    /// Base implementation of IMapper with default collection mapping
    /// </summary>
    public abstract class BaseMapper<TEntity, TDto> : IMapper<TEntity, TDto>
    {
        /// <summary>
        /// Maps a single entity to a DTO. Must be implemented by derived classes.
        /// </summary>
        public abstract TDto Map(TEntity entity);

        /// <summary>
        /// Maps a collection of entities to DTOs
        /// </summary>
        public virtual IEnumerable<TDto> Map(IEnumerable<TEntity> entities)
        {
            if (entities == null)
                return Enumerable.Empty<TDto>();

            return entities.Select(Map).ToList();
        }

        /// <summary>
        /// Maps a DTO back to an entity. Must be implemented by derived classes.
        /// </summary>
        public abstract TEntity MapToEntity(TDto dto);
    }
}
