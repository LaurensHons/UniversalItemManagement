using System;
using System.Linq;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities;

namespace UniversalItemManagement.Server.Mappers
{
    /// <summary>
    /// Mapper for Record entity to RecordDto with nested field DTOs
    /// </summary>
    public class RecordMapper : BaseMapper<Record, RecordDto>
    {
        private readonly FieldMapper _fieldMapper;

        public RecordMapper()
        {
            _fieldMapper = new FieldMapper();
        }

        public RecordMapper(FieldMapper fieldMapper)
        {
            _fieldMapper = fieldMapper ?? throw new ArgumentNullException(nameof(fieldMapper));
        }

        public override RecordDto Map(Record entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var dto = new RecordDto
            {
                Id = entity.Id,
                CreatedOn = entity.CreatedOn,
                ModifiedOn = entity.ModifiedOn,
                CreatedById = entity.CreatedById ?? Guid.Empty,
                ModifiedById = entity.ModifiedById ?? Guid.Empty,
                Name = entity.Name,
                Description = entity.Description
            };

            // Map nested fields if available
            if (entity.Fields != null && entity.Fields.Any())
            {
                dto.Fields = _fieldMapper.Map(entity.Fields).ToList();
            }

            return dto;
        }

        public override Record MapToEntity(RecordDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var entity = new Record
            {
                Id = dto.Id,
                CreatedOn = dto.CreatedOn,
                ModifiedOn = dto.ModifiedOn,
                CreatedById = dto.CreatedById == Guid.Empty ? null : dto.CreatedById,
                ModifiedById = dto.ModifiedById == Guid.Empty ? null : dto.ModifiedById,
                Name = dto.Name,
                Description = dto.Description
            };

            // Map nested fields if available
            if (dto.Fields != null && dto.Fields.Any())
            {
                entity.Fields = dto.Fields.Select(f => _fieldMapper.MapToEntity(f)).ToList();
            }

            return entity;
        }
    }
}
