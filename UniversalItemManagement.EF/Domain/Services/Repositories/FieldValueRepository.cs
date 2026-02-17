using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields.Values;

namespace UniversalItemManagement.EF.Domain.Services.Repositories
{
    public class FieldValueRepository : EntityRepository<FieldValue>
    {
        public FieldValueRepository(Context context) : base(context)
        {
        }
    }
}
