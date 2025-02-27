using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain
{
    [AttributeUsage(AttributeTargets.Class)]
    public class ContractAttribute : Attribute
    {
        public Type ContractType { get; set; }
    }
}
