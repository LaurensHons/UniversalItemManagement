using System;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.Server.Mappers
{
    /// <summary>
    /// Mapper for FieldProperty entity to FieldPropertyDto
    /// </summary>
    public class FieldPropertyMapper : BaseMapper<FieldProperty, FieldPropertyDto>
    {
        public override FieldPropertyDto Map(FieldProperty entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            return new FieldPropertyDto
            {
                Id = entity.Id,
                CreatedOn = entity.CreatedOn,
                ModifiedOn = entity.ModifiedOn,
                CreatedById = entity.CreatedById ?? Guid.Empty,
                ModifiedById = entity.ModifiedById ?? Guid.Empty,
                Name = entity.Name,
                Type = entity.Type.ToString()
            };
        }

        public override FieldProperty MapToEntity(FieldPropertyDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new FieldProperty
            {
                Id = dto.Id,
                CreatedOn = dto.CreatedOn,
                ModifiedOn = dto.ModifiedOn,
                CreatedById = dto.CreatedById == Guid.Empty ? null : dto.CreatedById,
                ModifiedById = dto.ModifiedById == Guid.Empty ? null : dto.ModifiedById,
                Name = dto.Name,
                Type = Enum.Parse<FieldPropertyType>(dto.Type)
            };
        }
    }
}
