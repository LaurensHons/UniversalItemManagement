using System;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class Field : Entity
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        public Guid? ValueId { get; set; }
        public FieldValue? FieldValue { get; set; }

        public Guid PropertyId { get; set; }
        public FieldProperty? Property { get; set; }

        public Guid RecordId { get; set; }
        public Record? Record { get; set; }
    }
}
