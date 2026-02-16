using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
            return query.Include(r => r.Fields);
        }
    }
}
