using UniversalItemManagement.EF.Domain.Models.Entities;

namespace UniversalItemManagement.EF.SeedData
{
    public static class UserSeed
    {
        public static readonly User[] Data = [
            new User() {
                Id = Guid.Parse("eae351f7-28dd-ee11-904c-000d3a43ea93"),
                Name = "System",
                Email = ""
            },
        ];
    }
}
