using System;
using System.Linq;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.Server.Mappers
{
    public class FieldMapper : BaseMapper<Field, FieldDto>
    {
        public override FieldDto Map(Field entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var dto = new FieldDto
            {
                Id = entity.Id,
                CreatedOn = entity.CreatedOn,
                ModifiedOn = entity.ModifiedOn,
                CreatedById = entity.CreatedById ?? Guid.Empty,
                ModifiedById = entity.ModifiedById ?? Guid.Empty,
                X = entity.X,
                Y = entity.Y,
                Width = entity.Width,
                Height = entity.Height,
                FieldPropertyId = entity.PropertyId,
                RecordId = entity.RecordId,
                ValueId = entity.ValueId
            };

            if (entity.Property != null)
            {
                dto.FieldPropertyName = entity.Property.Name;
                dto.FieldPropertyType = entity.Property.Type.ToString();
            }

            if (entity.FieldValue != null)
            {
                dto.TextValue = entity.FieldValue.TextValue;
                dto.BooleanValue = entity.FieldValue.BooleanValue;
                dto.DateValue = entity.FieldValue.DateValue;
                dto.NumberValue = entity.FieldValue.NumberValue;
                dto.SelectedItemIds = entity.FieldValue.SelectedItems?
                    .Select(li => li.Id).ToList();
            }

            return dto;
        }

        public override Field MapToEntity(FieldDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Field
            {
                Id = dto.Id,
                CreatedOn = dto.CreatedOn,
                ModifiedOn = dto.ModifiedOn,
                CreatedById = dto.CreatedById == Guid.Empty ? null : dto.CreatedById,
                ModifiedById = dto.ModifiedById == Guid.Empty ? null : dto.ModifiedById,
                X = dto.X,
                Y = dto.Y,
                Width = dto.Width,
                Height = dto.Height,
                PropertyId = dto.FieldPropertyId,
                RecordId = dto.RecordId,
                ValueId = dto.ValueId
            };
        }
    }
}
