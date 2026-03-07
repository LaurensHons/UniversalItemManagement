using System;

namespace UniversalItemManagement.EF.Domain.Models.Entities.Fields
{

    public enum FieldPropertyType
    {
        Text,
        Date,
        Boolean,
        Number,
        Select,
    }
    public class FieldProperty : Entity, INamedEntity
    {
        public string Name { get; set; }
        public FieldPropertyType Type { get; set; }
        public bool IsMultiSelect { get; set; }

        public Guid? ItemListId { get; set; }
        public ItemList? ItemList { get; set; }
    }
}
