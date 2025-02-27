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
    public class UTaskController : AbstractController<UTask>
    {
        public UTaskController(ILogger<AbstractController<UTask>> logger, Context context, IEntityRepository<UTask> repo) : base(logger, context, repo)
        {
        }
    }
}
