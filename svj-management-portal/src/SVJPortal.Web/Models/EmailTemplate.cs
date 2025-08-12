using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models
{
    public class EmailTemplate
    {
        public int Id { get; set; }
        
        [Required]
        [Display(Name = "Název šablony")]
        public string Nazev { get; set; }
        
        [Required]
        [Display(Name = "Předmět e-mailu")]
        public string Predmet { get; set; }
        
        [Required]
        [Display(Name = "Tělo e-mailu")]
        public string TeloEmailu { get; set; }
        
        [Display(Name = "Je globální")]
        public bool JeGlobalni { get; set; }
        
        [Display(Name = "Je aktivní")]
        public bool JeAktivni { get; set; } = true;
        
        [Display(Name = "Datum vytvoření")]
        public DateTime DatumVytvoreni { get; set; }
        
        [Display(Name = "Datum poslední úpravy")]
        public DateTime? DatumPosledniUpravy { get; set; }
        
        [Display(Name = "Vytvořeno uživatelem")]
        public string VytvorenoUzivatelem { get; set; }
        
        // Foreign key - null pro globální šablony
        [Display(Name = "SVJ")]
        public int? SVJId { get; set; }
        
        // Navigation property
        public virtual SVJ SVJ { get; set; }
        public virtual ICollection<EmailLog> EmailLogy { get; set; } = new List<EmailLog>();
    }
    
    public class EmailLog
    {
        public int Id { get; set; }
        
        [Required]
        public string Prijemce { get; set; }
        
        [Required]
        public string Predmet { get; set; }
        
        public string TeloEmailu { get; set; }
        
        public DateTime DatumOdeslani { get; set; }
        
        public bool UspesneOdeslano { get; set; }
        
        public string ChybovaZprava { get; set; }
        
        public string OdeslanoPres { get; set; }
        
        // Foreign keys
        public int? EmailTemplateId { get; set; }
        public int? SVJId { get; set; }
        
        // Navigation properties
        public virtual EmailTemplate EmailTemplate { get; set; }
        public virtual SVJ SVJ { get; set; }
        public virtual ICollection<EmailAttachment> Prilohy { get; set; } = new List<EmailAttachment>();
    }
    
    public class EmailAttachment
    {
        public int Id { get; set; }
        
        [Required]
        public string NazevSouboru { get; set; }
        
        [Required]
        public string CestaSouboru { get; set; }
        
        public long VelikostSouboru { get; set; }
        
        public string ContentType { get; set; }
        
        // Foreign key
        public int EmailLogId { get; set; }
        
        // Navigation property
        public virtual EmailLog EmailLog { get; set; }
    }
    
    public class EmailVariable
    {
        public int Id { get; set; }
        
        [Required]
        public string Nazev { get; set; }
        
        [Required]
        public string Popis { get; set; }
        
    public string? DefaultniHodnota { get; set; }
        
        public TypPromenne TypPromenne { get; set; }
        
        public bool JeSystemova { get; set; }
    }
    
    public enum TypPromenne
    {
        [Display(Name = "Statická")]
        Staticka = 1,
        
        [Display(Name = "Dynamická")]
        Dynamicka = 2,
        
        [Display(Name = "Systémová")]
        Systemova = 3
    }
}