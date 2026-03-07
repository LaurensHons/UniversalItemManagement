using System;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class ListItemValue : Entity
    {
        public Guid ListColumnId { get; set; }
        public ListColumn? ListColumn { get; set; }

        public Guid ListItemId { get; set; }
        public ListItem? ListItem { get; set; }

        public string? TextValue { get; set; }
        public bool? BooleanValue { get; set; }
        public DateTime? DateValue { get; set; }
        public decimal? NumberValue { get; set; }
    }
}
