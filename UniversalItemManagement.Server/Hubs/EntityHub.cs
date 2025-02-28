﻿using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;
using UniversalItemManagement.EF.Domain.Models;

namespace UniversalItemManagement.Server.Hubs
{
    public enum HubEnum
    {
        Record
    }
    public interface IClient
    {
        Task AddEntities(string entitySlice, IEnumerable<Entity> entity);
        Task UpdateEntities(string entitySlice, IEnumerable<Entity> entity);
        Task DeleteEntities(string entitySlice, IEnumerable<Guid> entity);
    }

    public class EntityHub : Hub<IClient>
    {

        public EntityHub()
        {
            var connection = new HubConnectionBuilder();
        }
        public async Task AddEntities(HubEnum entitySlice, IEnumerable<Entity> entity)  =>
            await Clients.Others.AddEntities(Enum.GetName(entitySlice)!, entity);

        public async Task UpdateEntities(HubEnum entitySlice, IEnumerable<Entity> entity) =>
            await Clients.Others.UpdateEntities(Enum.GetName(entitySlice)!, entity);

        public async Task DeleteEntities(HubEnum entitySlice, IEnumerable<Guid> entityIds) =>
            await Clients.Others.DeleteEntities(Enum.GetName(entitySlice)!, entityIds);
    }
}
