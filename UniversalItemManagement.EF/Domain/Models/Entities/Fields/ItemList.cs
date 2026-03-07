using System.Collections.Generic;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class ItemList : Entity, INamedEntity
    {
        public string Name { get; set; } = string.Empty;
        public ICollection<ListColumn> Columns { get; set; } = new List<ListColumn>();
        public ICollection<ListItem> Items { get; set; } = new List<ListItem>();
    }
}
