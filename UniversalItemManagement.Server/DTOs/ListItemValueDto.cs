using System;

namespace UniversalItemManagement.Server.DTOs
{
    public class ListItemValueDto
    {
        public Guid Id { get; set; }
        public Guid ListColumnId { get; set; }
        public Guid ListItemId { get; set; }

        public string? TextValue { get; set; }
        public bool? BooleanValue { get; set; }
        public DateTime? DateValue { get; set; }
        public decimal? NumberValue { get; set; }
    }
}
