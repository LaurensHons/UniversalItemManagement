using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Models;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values
{
    public class TextValue 
    {
        public Guid ValueId { get; set; }
        public string Value { get; set; } = string.Empty;
    }
}
