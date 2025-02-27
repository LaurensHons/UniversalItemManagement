using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values
{
    public interface IFieldValue<T> where T : class, IFieldValue<T>
    {
        public Guid ValueId { get; set; }
    }
}
