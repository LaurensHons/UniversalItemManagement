using Microsoft.AspNetCore.Mvc;
using UniversalItemManagement.Server.Mappers.Contracts;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    /// <summary>
    /// Abstract controller that uses mappers to transform entities to DTOs for GET operations
    /// Write operations use entities via IEntityService
    /// </summary>
    [ApiController]
    public abstract class AbstractMappedController<TEntity, TDto> : ControllerBase
        where TEntity : Entity
    {
        protected readonly ILogger _logger;
        protected readonly IEntityService<TEntity> _entityService;
        protected readonly IMapper<TEntity, TDto> _mapper;

        public AbstractMappedController(
            ILogger logger,
            IEntityService<TEntity> entityService,
            IMapper<TEntity, TDto> mapper
            )
        {
            _logger = logger;
            _entityService = entityService;
            _mapper = mapper;
        }

        /// <summary>
        /// GET all - returns DTOs
        /// </summary>
        [HttpGet()]
        public virtual async Task<IEnumerable<TDto>> Get()
        {
            var entities = await _entityService.ListAsync();
            return _mapper.Map(entities);
        }

        /// <summary>
        /// GET by ID - returns DTO
        /// </summary>
        [HttpGet("{id}")]
        public virtual async Task<ActionResult<TDto>> GetById([FromRoute] Guid id)
        {
            var entity = await _entityService.FindByIdAsync(id);
            if (entity == null)
                return NotFound();

            var dto = _mapper.Map(entity);
            return Ok(dto);
        }

        /// <summary>
        /// POST - accepts DTO, returns DTO
        /// Maps DTO to entity, uses IEntityService to trigger SignalR notifications, maps result back to DTO
        /// </summary>
        [HttpPost()]
        public virtual async Task<TDto> Post([FromBody] TDto dto)
        {
            var entity = _mapper.MapToEntity(dto);
            var savedEntity = await _entityService.Add(entity);
            return _mapper.Map(savedEntity);
        }

        /// <summary>
        /// PATCH - accepts DTO, returns DTO
        /// Maps DTO to entity, uses IEntityService to trigger SignalR notifications, maps result back to DTO
        /// </summary>
        [HttpPatch()]
        public virtual async Task<TDto> Update([FromBody] TDto dto)
        {
            var entity = _mapper.MapToEntity(dto);
            var savedEntity = await _entityService.Update(entity);
            return _mapper.Map(savedEntity);
        }

        /// <summary>
        /// DELETE - accepts DTO
        /// Maps DTO to entity, uses IEntityService to trigger SignalR notifications
        /// </summary>
        [HttpDelete()]
        public virtual async Task<bool> Delete([FromBody] TDto dto)
        {
            var entity = _mapper.MapToEntity(dto);
            await _entityService.Delete(entity);
            return true;
        }

        /// <summary>
        /// DELETE by ID
        /// Uses IEntityService to trigger SignalR notifications
        /// </summary>
        [HttpDelete("{id}")]
        public virtual async Task<bool> Delete([FromRoute] Guid id)
        {
            await _entityService.DeleteById(id);
            return true;
        }
    }
}
