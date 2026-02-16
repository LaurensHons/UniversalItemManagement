using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FieldPropertyController : AbstractController<FieldProperty>
    {
        public FieldPropertyController(ILogger<AbstractController<FieldProperty>> logger, IEntityService<FieldProperty> repo) : base(logger, repo)
        {
        }
    }
}
