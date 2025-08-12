using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models.Entities
{
    public class SVJ
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Název SVJ je povinný")]
        [StringLength(200, ErrorMessage = "Název nesmí být delší než 200 znaků")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "IČO je povinné")]
        [StringLength(8, MinimumLength = 8, ErrorMessage = "IČO musí mít 8 znaků")]
        public string ICO { get; set; } = string.Empty;
        
        [StringLength(12, ErrorMessage = "DIČ nesmí být delší než 12 znaků")]
        public string? DIC { get; set; }
        
        [Required(ErrorMessage = "Adresa je povinná")]
        [StringLength(300, ErrorMessage = "Adresa nesmí být delší než 300 znaků")]
        public string Address { get; set; } = string.Empty;
        
        [StringLength(10, ErrorMessage = "PSČ nesmí být delší než 10 znaků")]
        public string? PostalCode { get; set; }
        
        [StringLength(100, ErrorMessage = "Město nesmí být delší než 100 znaků")]
        public string? City { get; set; }
        
        [EmailAddress(ErrorMessage = "Neplatný formát emailu")]
        [StringLength(100, ErrorMessage = "Email nesmí být delší než 100 znaků")]
        public string? Email { get; set; }
        
        [StringLength(20, ErrorMessage = "Telefon nesmí být delší než 20 znaků")]
        public string? Phone { get; set; }
        
        [StringLength(30, ErrorMessage = "Číslo účtu nesmí být delší než 30 znaků")]
        public string? BankAccount { get; set; }
        
        [StringLength(11, ErrorMessage = "Kód banky nesmí být delší než 11 znaků")]
        public string? BankCode { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
        public virtual ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();
    }
}
