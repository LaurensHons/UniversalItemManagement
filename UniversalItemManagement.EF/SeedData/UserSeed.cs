using UniversalItemManagement.EF.Domain.Models.Entities;

namespace UniversalItemManagement.EF.SeedData
{
    public static class UserSeed
    {
        public static readonly Guid SystemUserGuid = Guid.Parse("00000000-0000-0000-0000-000000000001");
        public static readonly User[] Data = [
            new User() {
                Id = SystemUserGuid,
                Name = "System",
                Email = ""
            },
        ];
    }
}
