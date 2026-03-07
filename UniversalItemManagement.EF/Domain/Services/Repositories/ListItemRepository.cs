using System.Linq;
using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class ListItemRepository : EntityRepository<ListItem>
    {
        public ListItemRepository(Context context) : base(context)
        {
        }

        protected override IQueryable<ListItem> IncludeNavigationProperties(IQueryable<ListItem> query)
        {
            return query.Include(li => li.Values);
        }
    }
}
