using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models
{
    public interface INamedEntity
    {
        public string Name { get; set; }
    }
}
