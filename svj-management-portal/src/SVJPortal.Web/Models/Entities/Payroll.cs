using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models.Entities
{
    public class Payroll
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "SVJ je povinné")]
        public int SVJId { get; set; }
        
        [Required(ErrorMessage = "Zaměstnanec je povinný")]
        public int EmployeeId { get; set; }
        
        [Required(ErrorMessage = "Období je povinné")]
        public DateTime Period { get; set; }
        
        [Required(ErrorMessage = "Základní plat je povinný")]
        [Range(0, double.MaxValue, ErrorMessage = "Základní plat musí být kladné číslo")]
        public decimal BaseSalary { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Přesčasy musí být kladné číslo")]
        public decimal Overtime { get; set; } = 0;
        
        [Range(0, double.MaxValue, ErrorMessage = "Bonusy musí být kladné číslo")]
        public decimal Bonuses { get; set; } = 0;
        
        [Range(0, double.MaxValue, ErrorMessage = "Odpočty musí být kladné číslo")]
        public decimal Deductions { get; set; } = 0;
        
        public decimal SocialInsurance { get; set; } = 0;
        public decimal HealthInsurance { get; set; } = 0;
        public decimal IncomeTax { get; set; } = 0;
        
        public PayrollStatus Status { get; set; } = PayrollStatus.Draft;
        
        [StringLength(500, ErrorMessage = "Poznámky nesmí být delší než 500 znaků")]
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        
        [StringLength(100, ErrorMessage = "Schválil nesmí být delší než 100 znaků")]
        public string? ApprovedBy { get; set; }
        
        // Navigation properties
        public virtual SVJ SVJ { get; set; } = null!;
        public virtual Employee Employee { get; set; } = null!;
        
        // Computed properties
        public decimal GrossSalary => BaseSalary + Overtime + Bonuses;
        public decimal TotalDeductions => Deductions + SocialInsurance + HealthInsurance + IncomeTax;
        public decimal NetSalary => GrossSalary - TotalDeductions;
        
        public string PeriodDisplay => Period.ToString("MM/yyyy");
        public string StatusDisplay => Status switch
        {
            PayrollStatus.Draft => "Návrh",
            PayrollStatus.Approved => "Schváleno",
            PayrollStatus.Paid => "Vyplaceno",
            _ => "Neznámý"
        };
    }
    
    public enum PayrollStatus
    {
        Draft = 0,
        Approved = 1,
        Paid = 2
    }
}
