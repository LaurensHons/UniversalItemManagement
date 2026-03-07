using System;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{
    public class ListColumn : Entity, INamedEntity
    {
        public string Name { get; set; } = string.Empty;
        public FieldPropertyType Type { get; set; }
        public int Order { get; set; }
        public bool IsDisplayColumn { get; set; }

        public Guid ItemListId { get; set; }
        public ItemList? ItemList { get; set; }
    }
}
