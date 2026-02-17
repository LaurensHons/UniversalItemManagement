using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values
{
    public class DateValue
    {
        public Guid ValueId { get; set; }
        public DateTime Value { get; set; }
    }
}
