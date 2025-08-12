using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models.Entities
{
    public class Employee
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Jméno je povinné")]
        [StringLength(100, ErrorMessage = "Jméno nesmí být delší než 100 znaků")]
        public string FirstName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Příjmení je povinné")]  
        [StringLength(100, ErrorMessage = "Příjmení nesmí být delší než 100 znaků")]
        public string LastName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Rodné číslo je povinné")]
        [StringLength(11, MinimumLength = 9, ErrorMessage = "Neplatné rodné číslo")]
        public string PersonalNumber { get; set; } = string.Empty;
        
        [EmailAddress(ErrorMessage = "Neplatný formát emailu")]
        [StringLength(100, ErrorMessage = "Email nesmí být delší než 100 znaků")]
        public string? Email { get; set; }
        
        [StringLength(20, ErrorMessage = "Telefon nesmí být delší než 20 znaků")]
        public string? Phone { get; set; }
        
        [StringLength(300, ErrorMessage = "Adresa nesmí být delší než 300 znaků")]
        public string? Address { get; set; }
        
        [Required(ErrorMessage = "Pozice je povinná")]
        [StringLength(100, ErrorMessage = "Pozice nesmí být delší než 100 znaků")]
        public string Position { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Základní plat je povinný")]
        [Range(0, double.MaxValue, ErrorMessage = "Základní plat musí být kladné číslo")]
        public decimal BaseSalary { get; set; }
        
        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime? EndDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [Required(ErrorMessage = "SVJ je povinné")]
        public int SVJId { get; set; }
        
        [StringLength(30, ErrorMessage = "Číslo účtu nesmí být delší než 30 znaků")]
        public string? BankAccount { get; set; }
        
        [StringLength(11, ErrorMessage = "Kód banky nesmí být delší než 11 znaků")]
        public string? BankCode { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public virtual SVJ SVJ { get; set; } = null!;
        public virtual ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();
        
        // Computed properties
        public string FullName => $"{FirstName} {LastName}";
        public string DisplayName => $"{FullName} ({Position})";
    }
}
