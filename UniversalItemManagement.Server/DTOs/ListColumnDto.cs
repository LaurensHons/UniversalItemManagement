using System;

namespace UniversalItemManagement.Server.DTOs
{
    public class ListColumnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool IsDisplayColumn { get; set; }
        public Guid ItemListId { get; set; }
    }
}
