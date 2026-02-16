using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class FieldPropertyRepository : EntityRepository<FieldProperty>
    {
        public FieldPropertyRepository(Context context) : base(context)
        {
        }
    }
}
