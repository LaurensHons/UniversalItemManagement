using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.EF.Domain.Services.Repositories;
using UniversalItemManagement.Server.Hubs;
using UniversalItemManagement.Server.Middleware;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Services
{
    public class EntityUpdatedService<T> : IEntityService<T> where T : Entity
    {
        IEntityRepository<T> entityRepository;
        EntitySignalService signalService;
        HubEnum? topicValue = null;


        public EntityUpdatedService(
            IServiceProvider provider,
            HubEnum? _topicValue = null
        ) {

            entityRepository = provider.GetRequiredService<IEntityRepository<T>>();
            signalService = provider.GetRequiredService<EntitySignalService>();
            topicValue = _topicValue;
        }


        public Task<T> FindByIdAsync(Guid id)
        {
            return entityRepository.FindByIdAsync(id);
        }
        public Task<List<T>> ListAsync()
        {
            return entityRepository.ListAsync();
        }

        public async Task<T> Add(T entity)
        {
            var value = await entityRepository.Add(entity);
            if (topicValue.HasValue)
                await signalService.AddEntities(topicValue.Value, new List<T>() { entity });
            return value;
        }

        public async Task<T> Update(T entity)
        {
            var value = await entityRepository.Update(entity);
            if (topicValue.HasValue)
                await signalService.UpdateEntities(topicValue.Value, new List<T>() { entity });
            return value;
        }

        public async Task Delete(T entity)
        {
            await DeleteById(entity.Id);
        }

        public async Task DeleteById(Guid id)
        {
            await entityRepository.DeleteById(id);
            if (topicValue.HasValue)
                await signalService.DeleteEntities(topicValue.Value, new List<Guid>() { id });
        }
    }
}
