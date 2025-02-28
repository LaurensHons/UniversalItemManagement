using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.EF.Domain.Services.Repositories;
using UniversalItemManagement.Server.Hubs;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Services
{
    public class EntityUpdatedService<T> : IEntityService<T> where T : Entity
    {
        IEntityRepository<T> entityRepository;
        IHubContext<EntityHub, IClient> entityHub;
        IBackgroundTaskQueue backgroundTaskQueue;
        HubEnum? topicValue = null;

        EnumToStringConverter<HubEnum> converter = new EnumToStringConverter<HubEnum>();

        public EntityUpdatedService(
            IEntityRepository<T> _entityRepository,
            IHubContext<EntityHub, IClient> _entityHub,
            IBackgroundTaskQueue _backgroundTaskQueue,
            HubEnum? _topicValue = null
        ) {
            entityRepository = _entityRepository;
            entityHub = _entityHub;
            backgroundTaskQueue = _backgroundTaskQueue;
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

        public async Task<T> Add(T entity )
        {
            var value = await entityRepository.Add(entity);
            if (topicValue.HasValue)
                await entityHub.Clients.All.AddEntities(Enum.GetName(topicValue.Value)!, new List<T>() { entity });
            return value;
        }

        public async Task<T> Update(T entity)
        {
            var value = await entityRepository.Update(entity);
            if (topicValue.HasValue)
                    await entityHub.Clients.All.UpdateEntities(Enum.GetName(topicValue.Value)!, new List<T>() { entity });
                //await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync(async (_) =>
                //{
                //    Console.WriteLine("Doin the thing");
                //    await entityHub.UpdateEntities(topicValue.Value, new List<T>() { entity });
                //    return; 
                //});
                return value;
        }

        public async Task Delete(T entity)
        {
            await entityRepository.DeleteById(entity.Id);
            if (topicValue.HasValue)
                await entityHub.Clients.All.DeleteEntities(Enum.GetName(topicValue.Value)!, new List<Guid>() { entity.Id });
            return;
        }

        public async Task DeleteById(Guid id)
        {
            await entityRepository.DeleteById(id);
            if (topicValue.HasValue)
                await entityHub.Clients.All.DeleteEntities(Enum.GetName(topicValue.Value)!, new List<Guid>() { id });
            return;
        }
    }
}
