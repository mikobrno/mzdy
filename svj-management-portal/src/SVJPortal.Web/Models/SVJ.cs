using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models
{
    public class SVJ
    {
        public int Id { get; set; }
        
        [Required]
        [Display(Name = "Oficiální název")]
        public string Nazev { get; set; }
        
        [Required]
        [Display(Name = "IČO")]
        [StringLength(8, MinimumLength = 8)]
        public string ICO { get; set; }
        
        [Required]
        [Display(Name = "Adresa sídla")]
        public string Adresa { get; set; }
        
        [Required]
        [Display(Name = "Bankovní účet (IBAN)")]
        public string IBAN { get; set; }
        
        [Display(Name = "ID Datové schránky")]
        public string DatovaSchranka { get; set; }
        
        [Required]
        [Display(Name = "Kontaktní osoba")]
        public string KontaktniOsoba { get; set; }
        
        [Required]
        [EmailAddress]
        [Display(Name = "E-mail")]
        public string Email { get; set; }
        
        [Display(Name = "Rychlý popisek")]
        public string RychlyPopis { get; set; }
        
        [Required]
        [Display(Name = "Způsob odesílání výkazů")]
        public ZpusobOdesilaniEnum ZpusobOdesilani { get; set; }
        
        public DateTime DatumVytvoreni { get; set; }
        public DateTime? DatumPosledniUpravy { get; set; }
        
        public bool JeAktivni { get; set; } = true;
        
        // Navigation properties
        public virtual ICollection<Employee> Zamestnanci { get; set; } = new List<Employee>();
        public virtual ICollection<Payroll> Mzdy { get; set; } = new List<Payroll>();
        public virtual ICollection<EmailTemplate> EmailSablony { get; set; } = new List<EmailTemplate>();
        public virtual ICollection<AuditLog> AuditLogy { get; set; } = new List<AuditLog>();
    }
    
    public enum ZpusobOdesilaniEnum
    {
        [Display(Name = "Odesílá správce")]
        OdesilaSprávce = 1,
        
        [Display(Name = "Odesílá klient")]
        OdesilaKlient = 2
    }
}