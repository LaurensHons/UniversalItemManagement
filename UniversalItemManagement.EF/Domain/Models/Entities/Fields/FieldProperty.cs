using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public enum FieldPropertyType
    {
        Text,
        Date,
        Boolean,
    }
    public class FieldProperty : Entity, INamedEntity
    {
        public string Name { get; set; }
        public FieldPropertyType Type { get; set; }
    }
}
