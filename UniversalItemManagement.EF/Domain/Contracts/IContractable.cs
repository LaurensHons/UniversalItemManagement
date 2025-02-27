using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Models;

namespace UniversalItemManagement.EF.Domain.Contracts
{
    public abstract class IContractable<E, OE> where E : Entity, new() where OE : IContractable<E, OE>, new()
    {
        public E MapEntity()
        {
            E entity = new E();
            foreach (var property in this.GetType().GetProperties())
            {
                var entityProperty = entity.GetType().GetProperty(property.Name);
                if (entityProperty != null)
                {
                    entityProperty.SetValue(entity, property.GetValue(this));
                }
            }
            if (entity.Id == null)
                entity.Id = Guid.NewGuid();
            return entity;


        }
    }
}
