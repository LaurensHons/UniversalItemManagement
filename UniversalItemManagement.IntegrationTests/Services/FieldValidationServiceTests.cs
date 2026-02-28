using System.Linq.Expressions;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Middleware.Models;
using UniversalItemManagement.Server.Services;
using Xunit;
using Record = UniversalItemManagement.EF.Domain.Models.Entities.Record;

namespace UniversalItemManagement.IntegrationTests.Services;

public class FieldValidationServiceTests
{
    private readonly Guid _validRecordId = Guid.NewGuid();
    private readonly Guid _validFieldPropertyId = Guid.NewGuid();
    private readonly Guid _validFieldValueId = Guid.NewGuid();

    private FieldValidationService CreateService()
    {
        return new FieldValidationService(
            new StubEntityRepository<Record>(_validRecordId),
            new StubEntityRepository<FieldProperty>(_validFieldPropertyId),
            new StubEntityRepository<FieldValue>(_validFieldValueId)
        );
    }

    private FieldDto CreateValidDto() => new FieldDto
    {
        Id = Guid.NewGuid(),
        RecordId = _validRecordId,
        FieldPropertyId = _validFieldPropertyId,
        X = 0, Y = 0, Width = 3, Height = 1
    };

    [Fact]
    public async Task ValidateAsync_WithValidForeignKeys_DoesNotThrow()
    {
        var service = CreateService();
        var dto = CreateValidDto();

        await service.ValidateAsync(dto);
    }

    [Fact]
    public async Task ValidateAsync_WithInvalidRecordId_ThrowsForeignKeyValidationException()
    {
        var service = CreateService();
        var dto = CreateValidDto();
        dto.RecordId = Guid.NewGuid(); // non-existent

        var ex = await Assert.ThrowsAsync<ForeignKeyValidationException>(
            () => service.ValidateAsync(dto));

        Assert.Equal(nameof(Record), ex.EntityType);
        Assert.Equal(nameof(FieldDto.RecordId), ex.PropertyName);
        Assert.Equal(dto.RecordId, ex.InvalidId);
        Assert.Contains("Record", ex.Message);
        Assert.Contains("does not exist", ex.Message);
    }

    [Fact]
    public async Task ValidateAsync_WithInvalidFieldPropertyId_ThrowsForeignKeyValidationException()
    {
        var service = CreateService();
        var dto = CreateValidDto();
        dto.FieldPropertyId = Guid.NewGuid(); // non-existent

        var ex = await Assert.ThrowsAsync<ForeignKeyValidationException>(
            () => service.ValidateAsync(dto));

        Assert.Equal(nameof(FieldProperty), ex.EntityType);
        Assert.Equal(nameof(FieldDto.FieldPropertyId), ex.PropertyName);
        Assert.Equal(dto.FieldPropertyId, ex.InvalidId);
    }

    [Fact]
    public async Task ValidateAsync_WithInvalidValueId_ThrowsForeignKeyValidationException()
    {
        var service = CreateService();
        var dto = CreateValidDto();
        dto.ValueId = Guid.NewGuid(); // non-existent

        var ex = await Assert.ThrowsAsync<ForeignKeyValidationException>(
            () => service.ValidateAsync(dto));

        Assert.Equal(nameof(FieldValue), ex.EntityType);
        Assert.Equal(nameof(FieldDto.ValueId), ex.PropertyName);
    }

    [Fact]
    public async Task ValidateAsync_WithNullValueId_DoesNotValidateValueId()
    {
        var service = CreateService();
        var dto = CreateValidDto();
        dto.ValueId = null;

        await service.ValidateAsync(dto);
    }

    [Fact]
    public async Task ValidateAsync_WithValidValueId_DoesNotThrow()
    {
        var service = CreateService();
        var dto = CreateValidDto();
        dto.ValueId = _validFieldValueId;

        await service.ValidateAsync(dto);
    }

    /// <summary>
    /// Minimal stub repository that only implements ExistsAsync for validation tests.
    /// </summary>
    private class StubEntityRepository<T> : IEntityRepository<T> where T : Entity
    {
        private readonly HashSet<Guid> _existingIds;

        public StubEntityRepository(params Guid[] existingIds)
        {
            _existingIds = new HashSet<Guid>(existingIds);
        }

        public Task<bool> ExistsAsync(Guid id) => Task.FromResult(_existingIds.Contains(id));

        public Task<T?> FindByIdAsync(Guid id) => throw new NotImplementedException();
        public Task<T?> FindByConditionAsync(Expression<Func<T, bool>> conditions) => throw new NotImplementedException();
        public Task<List<T>> ListAsync() => throw new NotImplementedException();
        public Task<List<T>> ListAsync(int pageIndex, int pageSize) => throw new NotImplementedException();
        public Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions) => throw new NotImplementedException();
        public Task<List<T>> ListAsync(Expression<Func<T, bool>> conditions, int pageIndex, int pageSize) => throw new NotImplementedException();
        public Task<T> AddAsync(T entity) => throw new NotImplementedException();
        public Task<T> UpdateAsync(T entity) => throw new NotImplementedException();
        public Task DeleteAsync(T entity) => throw new NotImplementedException();
        public Task DeleteByIdAsync(Guid id) => throw new NotImplementedException();
    }
}
