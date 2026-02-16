using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Models.Entities
{
    public class Record : Entity, INamedEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public ICollection<Field> Fields { get; set; } = new List<Field>();
    }
}
