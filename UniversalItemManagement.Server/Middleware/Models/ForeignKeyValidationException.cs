using System;

namespace UniversalItemManagement.Server.Middleware.Models
{
    public class ForeignKeyValidationException : ArgumentException
    {
        public string EntityType { get; }
        public string PropertyName { get; }
        public Guid InvalidId { get; }

        public ForeignKeyValidationException(string entityType, string propertyName, Guid invalidId)
            : base($"{entityType} with ID '{invalidId}' does not exist (referenced by {propertyName})")
        {
            EntityType = entityType;
            PropertyName = propertyName;
            InvalidId = invalidId;
        }
    }
}
