using Microsoft.AspNetCore.Mvc;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Mappers;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListItemController : AbstractMappedController<ListItem, ListItemDto>
    {
        public ListItemController(
            ILogger<ListItemController> logger,
            IEntityService<ListItem> entityService,
            ListItemMapper mapper)
            : base(logger, entityService, mapper)
        {
        }
    }
}
