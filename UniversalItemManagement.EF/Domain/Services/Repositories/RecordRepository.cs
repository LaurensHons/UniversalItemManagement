using System.Linq;
using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class RecordRepository : EntityRepository<Record>
    {
        public RecordRepository(Context context) : base(context) { }

        protected override IQueryable<Record> IncludeNavigationProperties(IQueryable<Record> query)
        {
            return query
                .Include(r => r.Fields)
                    .ThenInclude(f => f.Property)
                .Include(r => r.Fields)
                    .ThenInclude(f => f.FieldValue)
                        .ThenInclude(fv => fv!.SelectedItems);
        }
    }
}
