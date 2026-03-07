using Microsoft.AspNetCore.Mvc;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Mappers;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemListController : AbstractMappedController<ItemList, ItemListDto>
    {
        public ItemListController(
            ILogger<ItemListController> logger,
            IEntityService<ItemList> entityService,
            ItemListMapper mapper)
            : base(logger, entityService, mapper)
        {
        }
    }
}
