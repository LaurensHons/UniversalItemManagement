using System.Linq;
using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class FieldPropertyRepository : EntityRepository<FieldProperty>
    {
        public FieldPropertyRepository(Context context) : base(context)
        {
        }

        protected override IQueryable<FieldProperty> IncludeNavigationProperties(IQueryable<FieldProperty> query)
        {
            return query
                .Include(fp => fp.ItemList)
                    .ThenInclude(il => il!.Columns.OrderBy(c => c.Order))
                .Include(fp => fp.ItemList)
                    .ThenInclude(il => il!.Items.OrderBy(i => i.Order))
                        .ThenInclude(i => i.Values);
        }
    }
}
