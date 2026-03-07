using System;
using System.Collections.Generic;

namespace UniversalItemManagement.Server.DTOs
{
    /// <summary>
    /// Data Transfer Object for FieldProperty
    /// </summary>
    public class FieldPropertyDto
    {
        public Guid Id { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? ModifiedById { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsMultiSelect { get; set; }

        public Guid? ItemListId { get; set; }
        public ItemListDto? ItemList { get; set; }
    }
}
