using System;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class FieldValue : Entity
    {
        public string? TextValue { get; set; }
        public bool? BooleanValue { get; set; }
        public DateTime? DateValue { get; set; }
    }
}
