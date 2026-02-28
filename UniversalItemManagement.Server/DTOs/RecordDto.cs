using System;
using System.Collections.Generic;

namespace UniversalItemManagement.Server.DTOs
{
    /// <summary>
    /// Data Transfer Object for Record with nested field DTOs
    /// </summary>
    public class RecordDto
    {
        public Guid Id { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
        public Guid CreatedById { get; set; }
        public Guid ModifiedById { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public List<FieldDto> Fields { get; set; } = new();
    }
}
