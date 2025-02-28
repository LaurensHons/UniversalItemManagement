using Microsoft.AspNetCore.SignalR;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.Server.Hubs;
using UniversalItemManagement.Server.Middleware;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Services
{
    public class EntitySignalService
    {
        IBackgroundTaskQueue backgroundTaskQueue;
        IHubContext<EntityHub, IClient> entityHub;
        HubConnectionService connectionService;

        public EntitySignalService(
            IBackgroundTaskQueue _backgroundTaskQueue,
            IHubContext<EntityHub, IClient> _entityHub,
            HubConnectionService _connectionService
            )
        {
            backgroundTaskQueue = _backgroundTaskQueue;
            entityHub = _entityHub;
            connectionService = _connectionService;
        }
        string ConnectionId { get { return this.connectionService.ConnectionId; } }

        public async Task AddEntities<T>(HubEnum value, List<T> list) where T : Entity
        {
            await ExecuteClientContext((client) => client.AddEntities(Enum.GetName(value)!, list), value);
        }

        public async Task UpdateEntities<T>(HubEnum value, List<T> list) where T : Entity
        {
            await ExecuteClientContext((client) => client.UpdateEntities(Enum.GetName(value)!, list), value);
        }

        public async Task DeleteEntities(HubEnum value, List<Guid> list)
        {
            await ExecuteClientContext((client) => client.DeleteEntities(Enum.GetName(value)!, list), value);
        }

        private async Task ExecuteClientContext(Func<IClient, Task> func, HubEnum topicValue)
        {

            if (string.IsNullOrWhiteSpace(ConnectionId))
                await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => func(entityHub.Clients.All));
            else
                await this.backgroundTaskQueue.QueueBackgroundWorkItemAsync((_) => func(entityHub.Clients.AllExcept([ConnectionId])));
        }
    }
}
