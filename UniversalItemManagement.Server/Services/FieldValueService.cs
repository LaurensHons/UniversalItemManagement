using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.Server.Services
{
    public class FieldValueService
    {
        private readonly Context _context;

        public FieldValueService(Context context)
        {
            _context = context;
        }

        public async Task EnsureFieldValueAsync(FieldDto dto)
        {
            if (!HasAnyValue(dto))
            {
                dto.ValueId = null;
                return;
            }

            FieldValue fieldValue;

            if (dto.ValueId.HasValue)
            {
                fieldValue = await _context.FieldValues
                    .Include(fv => fv.SelectedItems)
                    .FirstOrDefaultAsync(fv => fv.Id == dto.ValueId.Value)
                    ?? new FieldValue();
            }
            else
            {
                fieldValue = new FieldValue();
            }

            fieldValue.TextValue = dto.TextValue;
            fieldValue.BooleanValue = dto.BooleanValue;
            fieldValue.DateValue = dto.DateValue;
            fieldValue.NumberValue = dto.NumberValue;

            // Sync many-to-many selected items
            fieldValue.SelectedItems.Clear();
            if (dto.SelectedItemIds?.Any() == true)
            {
                var items = await _context.Set<ListItem>()
                    .Where(li => dto.SelectedItemIds.Contains(li.Id))
                    .ToListAsync();
                foreach (var item in items)
                {
                    fieldValue.SelectedItems.Add(item);
                }
            }

            if (fieldValue.Id == default)
            {
                _context.FieldValues.Add(fieldValue);
            }

            await _context.SaveChangesAsync();
            dto.ValueId = fieldValue.Id;
        }

        private static bool HasAnyValue(FieldDto dto) =>
            !string.IsNullOrEmpty(dto.TextValue) || dto.BooleanValue.HasValue || dto.DateValue.HasValue
            || dto.NumberValue.HasValue || (dto.SelectedItemIds?.Any() == true);
    }
}
