using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class Field : Entity
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        // Nullable foreign keys for each value type
        public Guid? TextValueId { get; set; }
        public FieldValue? TextValue { get; set; }

        public Guid? BooleanValueId { get; set; }
        public BooleanValue? BooleanValue { get; set; }

        public Guid? DateValueId { get; set; }
        public DateValue? DateValue { get; set; }

        public Guid PropertyId { get; set; }
        public FieldProperty? Property { get; set; }

        public Guid RecordId { get; set; }
        public Record? Record { get; set; }
    }
}
