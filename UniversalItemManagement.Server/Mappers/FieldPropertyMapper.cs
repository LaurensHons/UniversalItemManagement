using System;
using System.Linq;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.Server.Mappers
{
    public class FieldPropertyMapper : BaseMapper<FieldProperty, FieldPropertyDto>
    {
        public override FieldPropertyDto Map(FieldProperty entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var dto = new FieldPropertyDto
            {
                Id = entity.Id,
                CreatedOn = entity.CreatedOn,
                ModifiedOn = entity.ModifiedOn,
                CreatedById = entity.CreatedById ?? Guid.Empty,
                ModifiedById = entity.ModifiedById ?? Guid.Empty,
                Name = entity.Name,
                Type = entity.Type.ToString(),
                IsMultiSelect = entity.IsMultiSelect,
                ItemListId = entity.ItemListId
            };

            if (entity.ItemList != null)
            {
                dto.ItemList = new ItemListDto
                {
                    Id = entity.ItemList.Id,
                    CreatedOn = entity.ItemList.CreatedOn,
                    ModifiedOn = entity.ItemList.ModifiedOn,
                    CreatedById = entity.ItemList.CreatedById,
                    ModifiedById = entity.ItemList.ModifiedById,
                    Name = entity.ItemList.Name,
                    Columns = entity.ItemList.Columns?
                        .OrderBy(c => c.Order)
                        .Select(c => new ListColumnDto
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Type = c.Type.ToString(),
                            Order = c.Order,
                            IsDisplayColumn = c.IsDisplayColumn,
                            ItemListId = c.ItemListId
                        })
                        .ToList(),
                    Items = entity.ItemList.Items?
                        .OrderBy(i => i.Order)
                        .Select(i => new ListItemDto
                        {
                            Id = i.Id,
                            Order = i.Order,
                            Color = i.Color,
                            ItemListId = i.ItemListId,
                            Values = i.Values?.Select(v => new ListItemValueDto
                            {
                                Id = v.Id,
                                ListColumnId = v.ListColumnId,
                                ListItemId = v.ListItemId,
                                TextValue = v.TextValue,
                                BooleanValue = v.BooleanValue,
                                DateValue = v.DateValue,
                                NumberValue = v.NumberValue
                            }).ToList()
                        })
                        .ToList()
                };
            }

            return dto;
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
                Type = Enum.Parse<FieldPropertyType>(dto.Type),
                IsMultiSelect = dto.IsMultiSelect,
                ItemListId = dto.ItemListId
            };
        }
    }
}
