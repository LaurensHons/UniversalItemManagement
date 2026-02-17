using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values
{
    public class FieldValue : Entity
    {
        // Nullable foreign keys for each value type
        public Guid? TextValueId { get; set; }
        public TextValue? TextValue { get; set; }

        public Guid? BooleanValueId { get; set; }
        public BooleanValue? BooleanValue { get; set; }

        public Guid? DateValueId { get; set; }
        public DateValue? DateValue { get; set; }
    }
}
