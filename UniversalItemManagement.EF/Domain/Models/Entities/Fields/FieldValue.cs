using System;
using System.Collections.Generic;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class FieldValue : Entity
    {
        public string? TextValue { get; set; }
        public bool? BooleanValue { get; set; }
        public DateTime? DateValue { get; set; }
        public decimal? NumberValue { get; set; }

        public ICollection<ListItem> SelectedItems { get; set; } = new List<ListItem>();
    }
}
