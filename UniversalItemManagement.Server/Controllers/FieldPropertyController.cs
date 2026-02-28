using Microsoft.AspNetCore.Mvc;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Mappers;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FieldPropertyController : AbstractMappedController<FieldProperty, FieldPropertyDto>
    {
        public FieldPropertyController(
            ILogger<FieldPropertyController> logger,
            IEntityService<FieldProperty> entityService,
            FieldPropertyMapper mapper)
            : base(logger, entityService, mapper)
        {
        }
    }
}
