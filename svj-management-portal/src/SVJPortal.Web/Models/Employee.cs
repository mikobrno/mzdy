using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SVJPortal.Web.Models
{
    public class Employee
    {
        public int Id { get; set; }
        
        [Required]
        [Display(Name = "Jméno")]
        public string Jmeno { get; set; }
        
        [Required]
        [Display(Name = "Příjmení")]
        public string Prijmeni { get; set; }
        
        [Required]
        [Display(Name = "Rodné číslo")]
        [StringLength(11)]
        public string RodneCislo { get; set; }
        
        [Required]
        [Display(Name = "Adresa")]
        public string Adresa { get; set; }
        
        [Display(Name = "Telefon")]
        public string Telefon { get; set; }
        
        [EmailAddress]
        [Display(Name = "E-mail")]
        public string Email { get; set; }
        
        [Required]
        [Display(Name = "Typ úvazku")]
        public TypUvazkuEnum TypUvazku { get; set; }
        
        [Required]
        [Display(Name = "Výše odměny")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal VyseOdmeny { get; set; }
        
        [Required]
        [Display(Name = "Číslo účtu pro výplatu")]
        public string CisloUctu { get; set; }
        
        [Display(Name = "Exekuce/srážky")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? ExekuceSrazky { get; set; }
        
        [Display(Name = "Růžové prohlášení")]
        public bool RuzoveProhlaseni { get; set; }
        
        [Required]
        [Display(Name = "Zdravotní pojišťovna")]
        public ZdravotniPojistovnaEnum ZdravotniPojistovna { get; set; }
        
        [Required]
        [Display(Name = "Datum nástupu")]
        public DateTime DatumNastupu { get; set; }
        
        [Display(Name = "Datum ukončení")]
        public DateTime? DatumUkonceni { get; set; }
        
        public bool JeAktivni { get; set; } = true;
        
        // Foreign key
        [Required]
        public int SVJId { get; set; }
        
        // Navigation properties
        public virtual SVJ SVJ { get; set; }
        public virtual ICollection<Payroll> Mzdy { get; set; } = new List<Payroll>();
        public virtual ICollection<AuditLog> AuditLogy { get; set; } = new List<AuditLog>();
        
        [Display(Name = "Celé jméno")]
        public string CeleJmeno => $"{Jmeno} {Prijmeni}";
    }
    
    public enum TypUvazkuEnum
    {
        [Display(Name = "DPP")]
        DPP = 1,
        
        [Display(Name = "Člen výboru")]
        ClenVyboru = 2,
        
        [Display(Name = "Správce")]
        Spravce = 3,
        
        [Display(Name = "Úklidová služba")]
        UklidovaSluzba = 4
    }
    
    public enum ZdravotniPojistovnaEnum
    {
        [Display(Name = "VZP (111)")]
        VZP = 111,
        
        [Display(Name = "VOZP (201)")]
        VOZP = 201,
        
        [Display(Name = "ČPZP (205)")]
        CPZP = 205,
        
        [Display(Name = "OZP (207)")]
        OZP = 207,
        
        [Display(Name = "ZPŠ (209)")]
        ZPS = 209,
        
        [Display(Name = "ZPMV (211)")]
        ZPMV = 211,
        
        [Display(Name = "RBP (213)")]
        RBP = 213
    }
}