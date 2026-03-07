using Microsoft.AspNetCore.Mvc;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Mappers;
using UniversalItemManagement.Server.Services;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FieldController : AbstractMappedController<Field, FieldDto>
    {
        private readonly FieldValueService _fieldValueService;
        private readonly FieldValidationService _fieldValidationService;

        public FieldController(
            ILogger<FieldController> logger,
            IEntityService<Field> entityService,
            IEntityRepository<Field> repository,
            FieldValueService fieldValueService,
            FieldValidationService fieldValidationService,
            FieldMapper mapper)
            : base(logger, entityService, mapper)
        {
            _fieldValueService = fieldValueService;
            _fieldValidationService = fieldValidationService;
        }

        /// <summary>
        /// POST - accepts FieldDto, validates FK references, creates FieldValue if needed, returns FieldDto
        /// </summary>
        [HttpPost()]
        public override async Task<FieldDto> Post([FromBody] FieldDto dto)
        {
            await _fieldValidationService.ValidateAsync(dto);
            await _fieldValueService.EnsureFieldValueAsync(dto);
            var entity = _mapper.MapToEntity(dto);
            var savedEntity = await _entityService.Add(entity);
            var fetched = await _entityService.FindByIdAsync(savedEntity.Id);
            return _mapper.Map(fetched!);
        }

        /// <summary>
        /// PATCH - accepts FieldDto, validates FK references, creates/updates FieldValue if needed, returns FieldDto
        /// </summary>
        [HttpPatch()]
        public override async Task<FieldDto> Update([FromBody] FieldDto dto)
        {
            await _fieldValidationService.ValidateAsync(dto);
            await _fieldValueService.EnsureFieldValueAsync(dto);
            var entity = _mapper.MapToEntity(dto);
            var savedEntity = await _entityService.Update(entity);
            var fetched = await _entityService.FindByIdAsync(savedEntity.Id);
            return _mapper.Map(fetched!);
        }
    }
}
