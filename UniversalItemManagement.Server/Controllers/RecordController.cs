using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecordController : AbstractController<Record>
    {
        public RecordController(ILogger<AbstractController<Record>> logger, Context context, IEntityRepository<Record> repo) : base(logger, context, repo)
        {
        }
    }
}
