using System;
using System.Collections.Generic;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class ListItem : Entity
    {
        public int Order { get; set; }
        public string? Color { get; set; }

        public Guid ItemListId { get; set; }
        public ItemList? ItemList { get; set; }

        public ICollection<ListItemValue> Values { get; set; } = new List<ListItemValue>();
    }
}
