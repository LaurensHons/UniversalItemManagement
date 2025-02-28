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
        IHubContext<EntityHub, IClient> entityHub;
        IBackgroundTaskQueue backgroundTaskQueue;
        HubConnectionService connectionService;
        HubEnum? topicValue = null;


        public EntityUpdatedService(
            IServiceProvider provider,
            HubEnum? _topicValue = null
        ) {

            entityRepository = provider.GetRequiredService<IEntityRepository<T>>();
            entityHub = provider.GetRequiredService<IHubContext<EntityHub, IClient>>();
            backgroundTaskQueue = provider.GetRequiredService<IBackgroundTaskQueue>();
            connectionService = provider.GetRequiredService<HubConnectionService>();
            topicValue = _topicValue;
        }

        string ConnectionId { get { return this.connectionService.ConnectionId; } }

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
            {
                if (string.IsNullOrWhiteSpace(ConnectionId))
                    await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => entityHub.Clients.All.AddEntities(Enum.GetName(topicValue.Value)!, new List<T>() { entity }));
                else
                    await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => entityHub.Clients.AllExcept([ConnectionId]).AddEntities(Enum.GetName(topicValue.Value)!, new List<T>() { entity }));
            }
            return value;
        }

        public async Task<T> Update(T entity)
        {
            var value = await entityRepository.Update(entity);
            if (topicValue.HasValue)
            {
                if (string.IsNullOrWhiteSpace(ConnectionId))
                    await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => entityHub.Clients.All.UpdateEntities(Enum.GetName(topicValue.Value)!, new List<T>() { entity }));
                else
                    await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => entityHub.Clients.AllExcept([ConnectionId]).UpdateEntities(Enum.GetName(topicValue.Value)!, new List<T>() { entity }));
            }
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
               {
                if (string.IsNullOrWhiteSpace(ConnectionId))
                    await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => entityHub.Clients.All.DeleteEntities(Enum.GetName(topicValue.Value)!, new List<Guid>() { id }));
                else
                    await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => entityHub.Clients.AllExcept([ConnectionId]).DeleteEntities(Enum.GetName(topicValue.Value)!, new List<Guid>() {id }));
            }
        }
    }
}
