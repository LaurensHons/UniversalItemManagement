using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Contracts
{
    public interface IItem
    {
        Guid Id { get; set; }   
    }
}
