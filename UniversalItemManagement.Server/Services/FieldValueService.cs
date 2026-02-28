using System.Threading.Tasks;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;

namespace UniversalItemManagement.Server.Services
{
    public class FieldValueService
    {
        private readonly IEntityRepository<FieldValue> _fieldValueRepository;

        public FieldValueService(IEntityRepository<FieldValue> fieldValueRepository)
        {
            _fieldValueRepository = fieldValueRepository;
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
                fieldValue = await _fieldValueRepository.FindByIdAsync(dto.ValueId.Value)
                    ?? new FieldValue();
            }
            else
            {
                fieldValue = new FieldValue();
            }

            fieldValue.TextValue = dto.TextValue;
            fieldValue.BooleanValue = dto.BooleanValue;
            fieldValue.DateValue = dto.DateValue;

            if (fieldValue.Id == default)
            {
                fieldValue = await _fieldValueRepository.AddAsync(fieldValue);
            }
            else
            {
                fieldValue = await _fieldValueRepository.UpdateAsync(fieldValue);
            }

            dto.ValueId = fieldValue.Id;
        }

        private static bool HasAnyValue(FieldDto dto) =>
            !string.IsNullOrEmpty(dto.TextValue) || dto.BooleanValue.HasValue || dto.DateValue.HasValue;
    }
}
