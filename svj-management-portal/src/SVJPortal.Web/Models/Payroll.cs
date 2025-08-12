using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SVJPortal.Web.Models
{
    public class Payroll
    {
        public int Id { get; set; }
        
        [Required]
        [Display(Name = "Rok")]
        public int Rok { get; set; }
        
        [Required]
        [Display(Name = "Měsíc")]
        [Range(1, 12)]
        public int Mesic { get; set; }
        
        [Required]
        [Display(Name = "Hrubá mzda")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal HrubaMzda { get; set; }
        
        [Display(Name = "Sociální pojištění")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SocialniPojisteni { get; set; }
        
        [Display(Name = "Zdravotní pojištění")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ZdravotniPojisteni { get; set; }
        
        [Display(Name = "Daň z příjmu")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DanZPrijmu { get; set; }
        
        [Display(Name = "Exekuce/srážky")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ExekuceSrazky { get; set; }
        
        [Display(Name = "Čistá mzda")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CistaMzda { get; set; }
        
        [Display(Name = "Náklady zaměstnavatele")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NakladyZamestnavatele { get; set; }
        
        [Display(Name = "Stav")]
        public StavMzdyEnum Stav { get; set; } = StavMzdyEnum.Pripravena;
        
        [Display(Name = "Datum vytvoření")]
        public DateTime DatumVytvoreni { get; set; }
        
        [Display(Name = "Datum schválení")]
        public DateTime? DatumSchvaleni { get; set; }
        
        [Display(Name = "Schváleno uživatelem")]
        public string SchvalenoUzivatelem { get; set; }
        
        [Display(Name = "Poznámky")]
        public string Poznamky { get; set; }
        
        // Foreign keys
        [Required]
        public int EmployeeId { get; set; }
        
        [Required]
        public int SVJId { get; set; }
        
        // Navigation properties
        public virtual Employee Employee { get; set; }
        public virtual SVJ SVJ { get; set; }
        
        [Display(Name = "Název měsíce")]
        public string NazevMesice => new DateTime(Rok, Mesic, 1).ToString("MMMM yyyy", new System.Globalization.CultureInfo("cs-CZ"));
    }
    
    public enum StavMzdyEnum
    {
        [Display(Name = "Připravena")]
        Pripravena = 1,
        
        [Display(Name = "Hotová")]
        Hotova = 2,
        
        [Display(Name = "Schválená")]
        Schvalena = 3,
        
        [Display(Name = "Vyplacená")]
        Vyplacena = 4
    }
}