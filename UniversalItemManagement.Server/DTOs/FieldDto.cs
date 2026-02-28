using System;

namespace UniversalItemManagement.Server.DTOs
{
    /// <summary>
    /// Data Transfer Object for Field with flattened value structure
    /// </summary>
    public class FieldDto
    {
        public Guid Id { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
        public Guid CreatedById { get; set; }
        public Guid ModifiedById { get; set; }

        // Positioning properties
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        // Field property information
        public Guid FieldPropertyId { get; set; }
        public string FieldPropertyName { get; set; } = string.Empty;
        public string FieldPropertyType { get; set; } = string.Empty;

        // Record relationship
        public Guid RecordId { get; set; }

        // Value - only one will be populated based on FieldPropertyType
        public string? TextValue { get; set; }
        public bool? BooleanValue { get; set; }
        public DateTime? DateValue { get; set; }

        // FieldValue FK
        public Guid? ValueId { get; set; }
        public bool HasValue => ValueId.HasValue;
    }
}
