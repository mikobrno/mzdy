using System;
using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        
        [Required]
        [Display(Name = "Název tabulky")]
        public string NazevTabulky { get; set; }
        
        [Required]
        [Display(Name = "ID záznamu")]
        public string IdZaznamu { get; set; }
        
        [Required]
        [Display(Name = "Akce")]
        public string Akce { get; set; }
        
        [Display(Name = "Původní hodnoty")]
        public string PuvodniHodnoty { get; set; }
        
        [Display(Name = "Nové hodnoty")]
        public string NoveHodnoty { get; set; }
        
        [Required]
        [Display(Name = "Datum změny")]
        public DateTime DatumZmeny { get; set; }
        
        [Required]
        [Display(Name = "Uživatel")]
        public string Uzivatel { get; set; }
        
        [Display(Name = "IP adresa")]
        public string IPAdresa { get; set; }
        
        [Display(Name = "User Agent")]
        public string UserAgent { get; set; }
        
        // Foreign keys pro vztahy
        public int? SVJId { get; set; }
        public int? EmployeeId { get; set; }
        public int? PayrollId { get; set; }
        
        // Navigation properties
        public virtual SVJ SVJ { get; set; }
        public virtual Employee Employee { get; set; }
        public virtual Payroll Payroll { get; set; }
    }
}
