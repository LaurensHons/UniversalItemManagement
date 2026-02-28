using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class FieldValueRepository : EntityRepository<FieldValue>
    {
        public FieldValueRepository(Context context) : base(context)
        {
        }
    }
}
