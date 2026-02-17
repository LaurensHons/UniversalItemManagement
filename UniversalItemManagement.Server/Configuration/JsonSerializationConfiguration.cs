using System.Text.Json;
using System.Text.Json.Serialization;

namespace UniversalItemManagement.Server.Configuration
{
    public static class JsonSerializationConfiguration
    {
        public static void ConfigureJsonSerializerOptions(JsonSerializerOptions options)
        {
            options.Converters.Add(new JsonStringEnumConverter());
            options.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        }
    }
}
