using Microsoft.AspNetCore.Mvc;
using UniversalItemManagement.Server.DTOs;
using UniversalItemManagement.Server.Mappers;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecordController : AbstractMappedController<Record, RecordDto>
    {
        public RecordController(
            ILogger<RecordController> logger,
            IEntityService<Record> entityService,
            RecordMapper mapper)
            : base(logger, entityService, mapper)
        {
        }
    }
}
