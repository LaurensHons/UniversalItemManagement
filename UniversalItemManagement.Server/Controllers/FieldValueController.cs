using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FieldValueController : AbstractController<FieldValue>
    {
        public FieldValueController(ILogger<AbstractController<FieldValue>> logger, IEntityService<FieldValue> repo) : base(logger, repo)
        {
        }
    }
}
