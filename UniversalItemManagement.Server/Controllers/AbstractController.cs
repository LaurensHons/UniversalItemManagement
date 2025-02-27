using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain;
using UniversalItemManagement.EF.Domain.Contracts;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    public abstract class AbstractController<T> : ControllerBase where T : Entity
    {
        private readonly ILogger<AbstractController<T>> _logger;
        private readonly IEntityRepository<T> _repo;

        public AbstractController(
            ILogger<AbstractController<T>> logger, 
            Context context,
            IEntityRepository<T> repo
            )
        {
            _logger = logger;
            _repo = repo;
        }

        [HttpGet()]
        public virtual async Task<IEnumerable<T>> Get()
        {
            return await _repo.ListAsync();
        }

        [HttpGet(":id")]
        public virtual async Task<T> GetById([FromRoute] Guid id)
        {
            return await _repo.FindByIdAsync(id);
        }

        [HttpPost()]
        public virtual async Task<T> Post([FromBody] T task)
        {
            return await _repo.Add( task);
        }

        [HttpPatch()]
        public virtual async Task<T> Update([FromBody] T task)
        {
            return await _repo.Update(task);
        }

        [HttpDelete()]
        public virtual async Task<bool> Delete([FromBody] T task)
        {
            await _repo.Delete(task);
            return true;
        }

        [HttpDelete("/:id")]
        public virtual async Task<bool> Delete([FromRoute] Guid id)
        {
            await _repo.DeleteById(id);
            return true;
        }
    }
}
