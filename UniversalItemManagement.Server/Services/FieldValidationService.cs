using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Middleware.Models;

namespace UniversalItemManagement.Server.Services
{
    public class FieldValidationService
    {
        private readonly IEntityRepository<Record> _recordRepository;
        private readonly IEntityRepository<FieldProperty> _fieldPropertyRepository;
        private readonly IEntityRepository<FieldValue> _fieldValueRepository;

        public FieldValidationService(
            IEntityRepository<Record> recordRepository,
            IEntityRepository<FieldProperty> fieldPropertyRepository,
            IEntityRepository<FieldValue> fieldValueRepository)
        {
            _recordRepository = recordRepository;
            _fieldPropertyRepository = fieldPropertyRepository;
            _fieldValueRepository = fieldValueRepository;
        }

        public async Task ValidateAsync(FieldDto dto)
        {
            if (!await _recordRepository.ExistsAsync(dto.RecordId))
            {
                throw new ForeignKeyValidationException(
                    nameof(Record), nameof(dto.RecordId), dto.RecordId);
            }

            if (!await _fieldPropertyRepository.ExistsAsync(dto.FieldPropertyId))
            {
                throw new ForeignKeyValidationException(
                    nameof(FieldProperty), nameof(dto.FieldPropertyId), dto.FieldPropertyId);
            }

            if (dto.ValueId.HasValue && !await _fieldValueRepository.ExistsAsync(dto.ValueId.Value))
            {
                throw new ForeignKeyValidationException(
                    nameof(FieldValue), nameof(dto.ValueId), dto.ValueId.Value);
            }
        }
    }
}
