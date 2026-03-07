using System.Linq;
using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class ItemListRepository : EntityRepository<ItemList>
    {
        public ItemListRepository(Context context) : base(context)
        {
        }

        protected override IQueryable<ItemList> IncludeNavigationProperties(IQueryable<ItemList> query)
        {
            return query
                .Include(il => il.Columns.OrderBy(c => c.Order))
                .Include(il => il.Items.OrderBy(i => i.Order))
                    .ThenInclude(i => i.Values);
        }
    }
}
