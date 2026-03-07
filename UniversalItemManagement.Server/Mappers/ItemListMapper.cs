using System;
using System.Linq;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.Server.Mappers
{
    public class ItemListMapper : BaseMapper<ItemList, ItemListDto>
    {
        public override ItemListDto Map(ItemList entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var dto = new ItemListDto
            {
                Id = entity.Id,
                CreatedOn = entity.CreatedOn,
                ModifiedOn = entity.ModifiedOn,
                CreatedById = entity.CreatedById,
                ModifiedById = entity.ModifiedById,
                Name = entity.Name
            };

            if (entity.Columns != null && entity.Columns.Any())
            {
                dto.Columns = entity.Columns
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
                    .ToList();
            }

            if (entity.Items != null && entity.Items.Any())
            {
                dto.Items = entity.Items
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
                    .ToList();
            }

            return dto;
        }

        public override ItemList MapToEntity(ItemListDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var entity = new ItemList
            {
                Id = dto.Id,
                CreatedOn = dto.CreatedOn,
                ModifiedOn = dto.ModifiedOn,
                CreatedById = dto.CreatedById,
                ModifiedById = dto.ModifiedById,
                Name = dto.Name
            };

            if (dto.Columns != null && dto.Columns.Any())
            {
                entity.Columns = dto.Columns.Select(c => new ListColumn
                {
                    Id = c.Id,
                    Name = c.Name,
                    Type = Enum.Parse<FieldPropertyType>(c.Type),
                    Order = c.Order,
                    IsDisplayColumn = c.IsDisplayColumn,
                    ItemListId = c.ItemListId
                }).ToList();
            }

            return entity;
        }
    }
}
