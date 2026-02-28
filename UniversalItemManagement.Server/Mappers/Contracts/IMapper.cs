using System.Collections.Generic;

namespace UniversalItemManagement.Server.Mappers.Contracts
{
    /// <summary>
    /// Defines a contract for bidirectional mapping between entity and DTO
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    /// <typeparam name="TDto">DTO type</typeparam>
    public interface IMapper<TEntity, TDto>
    {
        /// <summary>
        /// Maps a single entity to a DTO
        /// </summary>
        TDto Map(TEntity entity);

        /// <summary>
        /// Maps a collection of entities to DTOs
        /// </summary>
        IEnumerable<TDto> Map(IEnumerable<TEntity> entities);

        /// <summary>
        /// Maps a DTO back to an entity
        /// </summary>
        TEntity MapToEntity(TDto dto);
    }
}
