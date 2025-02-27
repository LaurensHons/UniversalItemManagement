using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniversalItemManagement.EF.Domain.Models.Entities
{
    public class User
    {
        [Key]
        [Required]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Email { get; set; }

        [Required]
        public DateTime CreatedOn
        {
            get; set;
        }
        [Required]
        public DateTime ModifiedOn
        {

            get; set;
        }
    }
}
