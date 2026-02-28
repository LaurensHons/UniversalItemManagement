using Microsoft.EntityFrameworkCore;
using System.Linq;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class FieldRepository : EntityRepository<Field>
    {
        public FieldRepository(Context context) : base(context)
        {
        }

        protected override IQueryable<Field> IncludeNavigationProperties(IQueryable<Field> query)
        {
            return query
                .Include(f => f.Property)
                .Include(f => f.FieldValue);
        }
    }
}
