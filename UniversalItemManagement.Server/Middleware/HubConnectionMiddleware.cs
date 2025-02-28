using System.Globalization;
using UniversalItemManagement.Server.Hubs;

namespace UniversalItemManagement.Server.Middleware
{
    public class HubConnectionService
    {
        public HubConnectionService() { }
        public string? ConnectionId;
    }
    public class HubConnectionMiddleware
    {
        //HubConnectionService service;
        //public HubConnectionMiddleware(HubConnectionService _service)
        //{
        //    service = _service;
        //}
        public HubConnectionMiddleware()
        {

        }
        public Task Invoke(HttpContext context)
        {
            var connectionId = context.Request.Cookies[EntityHub.ConnectionCookieKey];
            if (string.IsNullOrWhiteSpace(connectionId)) return Task.CompletedTask;
            //service.ConnectionId = connectionId;
            return Task.CompletedTask;
        }
    }
}
