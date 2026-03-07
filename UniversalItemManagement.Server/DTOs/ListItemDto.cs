using System;
using System.Collections.Generic;

namespace UniversalItemManagement.Server.DTOs
{
    public class ListItemDto
    {
        public Guid Id { get; set; }
        public int Order { get; set; }
        public string? Color { get; set; }
        public Guid ItemListId { get; set; }

        public List<ListItemValueDto>? Values { get; set; }
    }
}
