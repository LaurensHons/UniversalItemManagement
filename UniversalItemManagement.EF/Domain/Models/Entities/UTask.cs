using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models.Entities
{
    public class UTask : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
