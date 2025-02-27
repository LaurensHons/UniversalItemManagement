using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Models.Entities;

namespace UniversalItemManagement.EF.SeedData
{
    public static class RecordSeed
    {
        public static readonly Record[] Data = [
            new Record() {
                Id = Guid.NewGuid(),
                Name = "Test",
                Description = "Bla"
            },
        ];
    }
}
