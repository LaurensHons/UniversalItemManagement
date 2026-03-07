using System;
using System.Linq;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.Server.Mappers
{
    public class ListItemMapper : BaseMapper<ListItem, ListItemDto>
    {
        public override ListItemDto Map(ListItem entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            return new ListItemDto
            {
                Id = entity.Id,
                Order = entity.Order,
                Color = entity.Color,
                ItemListId = entity.ItemListId,
                Values = entity.Values?.Select(v => new ListItemValueDto
                {
                    Id = v.Id,
                    ListColumnId = v.ListColumnId,
                    ListItemId = v.ListItemId,
                    TextValue = v.TextValue,
                    BooleanValue = v.BooleanValue,
                    DateValue = v.DateValue,
                    NumberValue = v.NumberValue
                }).ToList()
            };
        }

        public override ListItem MapToEntity(ListItemDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var entity = new ListItem
            {
                Id = dto.Id,
                Order = dto.Order,
                Color = dto.Color,
                ItemListId = dto.ItemListId
            };

            if (dto.Values != null && dto.Values.Any())
            {
                entity.Values = dto.Values.Select(v => new ListItemValue
                {
                    Id = v.Id,
                    ListColumnId = v.ListColumnId,
                    ListItemId = v.ListItemId,
                    TextValue = v.TextValue,
                    BooleanValue = v.BooleanValue,
                    DateValue = v.DateValue,
                    NumberValue = v.NumberValue
                }).ToList();
            }

            return entity;
        }
    }
}
