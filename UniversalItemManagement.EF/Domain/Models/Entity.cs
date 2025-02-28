using Microsoft.AspNetCore.Components;
using System;
using System.ComponentModel.DataAnnotations;
using UniversalItemManagement.EF.Domain.Models.Entities;

namespace UniversalItemManagement.EF.Domain.Models
{
    public class Entity
    {
        [Key]
        [Required]
        public Guid Id
        {
            get; set;
        }
        public DateTime? CreatedOn
        {
            get; set;
        }
        public DateTime? ModifiedOn
        {

            get; set;
        }
        public Guid? CreatedById
        {
            get; set;
        }
        public Guid? ModifiedById
        {
            get; set;
        }

        [CascadingParameter]
        public virtual User? CreatedBy
        {
            get; set;
        }
        public virtual User? ModifiedBy
        {
            get; set;
        }
    }
}
