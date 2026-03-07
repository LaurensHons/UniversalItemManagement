using System;
using System.Collections.Generic;

namespace UniversalItemManagement.Server.DTOs
{
    public class ItemListDto
    {
        public Guid Id { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? ModifiedById { get; set; }

        public string Name { get; set; } = string.Empty;

        public List<ListColumnDto>? Columns { get; set; }
        public List<ListItemDto>? Items { get; set; }
    }
}
