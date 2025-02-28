using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain;
using UniversalItemManagement.EF.Domain.Contracts;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Services.Contracts;
using UniversalItemManagement.Server.Services.Contracts;

namespace UniversalItemManagement.Server.Controllers
{
    [ApiController]
    public abstract class AbstractController<T> : ControllerBase where T : Entity
    {
        private readonly ILogger<AbstractController<T>> _logger;
        private readonly IEntityService<T> _service;

        public AbstractController(
            ILogger<AbstractController<T>> logger,
            IEntityService<T> service
            )
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet()]
        public virtual async Task<IEnumerable<T>> Get()
        {
            return await _service.ListAsync();
        }

        [HttpGet(":id")]
        public virtual async Task<T> GetById([FromRoute] Guid id)
        {
            return await _service.FindByIdAsync(id);
        }

        [HttpPost()]
        public virtual async Task<T> Post([FromBody] T task)
        {
            return await _service.Add(task);
        }

        [HttpPatch()]
        public virtual async Task<T> Update([FromBody] T task)
        {
            return await _service.Update(task);
        }

        [HttpDelete()]
        public virtual async Task<bool> Delete([FromBody] T task)
        {
            await _service.Delete(task);
            return true;
        }

        [HttpDelete(":id")]
        public virtual async Task<bool> Delete([FromRoute] Guid id)
        {
            await _service.DeleteById(id);
            return true;
        }
    }
}
