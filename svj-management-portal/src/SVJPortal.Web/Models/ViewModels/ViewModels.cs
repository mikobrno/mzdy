using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models.ViewModels
{
    public class DashboardViewModel
    {
        public List<SVJCardViewModel> SVJCards { get; set; } = new List<SVJCardViewModel>();
        public string UzivatelskaPoznamka { get; set; }
        public int CelkemSVJ { get; set; }
        public int AktivnichZamestnancu { get; set; }
        public int ZpracovanychMezdAktualneMesic { get; set; }
        public int NeodeslanychtEmailu { get; set; }
    }
    
    public class SVJIndexViewModel
    {
        public List<SVJ> SVJs { get; set; } = new List<SVJ>();
    }
    
    public class SVJCardViewModel
    {
        public int Id { get; set; }
        public string Nazev { get; set; }
        public string RychlyPopis { get; set; }
        public ZpusobOdesilaniEnum ZpusobOdesilani { get; set; }
        public string KontaktniEmail { get; set; }
        public MzdyStavViewModel[] StavMzedVRoce { get; set; } = new MzdyStavViewModel[12];
        public int PocetZamestnancu { get; set; }
        public decimal CelkoveMzdyAktualneMesic { get; set; }
        public bool MaNeodeslaneEmaily { get; set; }
    }
    
    public class MzdyStavViewModel
    {
        public int Mesic { get; set; }
        public bool JeZpracovana { get; set; }
        public bool JeSchvalena { get; set; }
        public StavMzdyEnum Stav { get; set; }
        public string NazevMesice { get; set; }
    }
    
    public class SVJDetailViewModel
    {
        public SVJ SVJ { get; set; }
        public List<Employee> Zamestnanci { get; set; } = new List<Employee>();
        public List<Payroll> PosledniMzdy { get; set; } = new List<Payroll>();
        public List<EmailTemplate> EmailSablony { get; set; } = new List<EmailTemplate>();
        public MzdyStavViewModel[] StavMzedVRoce { get; set; } = new MzdyStavViewModel[12];
    }
    
    public class PayrollListViewModel
    {
        public int SVJId { get; set; }
        public string NazevSVJ { get; set; }
        public int VybranyRok { get; set; }
        public int VybranyMesic { get; set; }
        public List<PayrollItemViewModel> Mzdy { get; set; } = new List<PayrollItemViewModel>();
        public bool MohuSchvalit { get; set; }
        public bool VsechnySchvaleny { get; set; }
    }
    
    public class PayrollItemViewModel
    {
        public int Id { get; set; }
        public string JmenoZamestnance { get; set; }
        public TypUvazkuEnum TypUvazku { get; set; }
        public decimal HrubaMzda { get; set; }
        public decimal CistaMzda { get; set; }
        public StavMzdyEnum Stav { get; set; }
        public DateTime? DatumSchvaleni { get; set; }
        public bool MohuUpravit { get; set; }
    }
    
    public class PayrollEditViewModel
    {
        public Payroll Payroll { get; set; }
        public Employee Employee { get; set; }
        public SVJ SVJ { get; set; }
        public bool JeDPPLimit { get; set; }
        public decimal ZbyvajiciDPPLimit { get; set; }
        public decimal VypocitaneSocialniPojisteni { get; set; }
        public decimal VypocitaneZdravotniPojisteni { get; set; }
        public decimal VypocitanaDan { get; set; }
    }
    
    public class EmployeeCreateEditViewModel
    {
        public Employee Employee { get; set; }
        public int SVJId { get; set; }
        public string NazevSVJ { get; set; }
        public bool JeNovy { get; set; }
        public List<AuditLog> Historie { get; set; } = new List<AuditLog>();
    }
    
    public class EmailTemplateViewModel
    {
        public EmailTemplate Template { get; set; }
        public List<EmailVariable> DostupnePromenne { get; set; } = new List<EmailVariable>();
        public Dictionary<string, string> HodnotyPromen { get; set; } = new Dictionary<string, string>();
        public string NahledSubjektu { get; set; }
        public string NahledTela { get; set; }
    }
    
    public class EmailSendViewModel
    {
        public int SVJId { get; set; }
        public string NazevSVJ { get; set; }
        public int? TemplateId { get; set; }
        
        [Required]
        [Display(Name = "Příjemci")]
        public string Prijemci { get; set; }
        
        [Required]
        [Display(Name = "Předmět")]
        public string Predmet { get; set; }
        
        [Required]
        [Display(Name = "Tělo e-mailu")]
        public string TeloEmailu { get; set; }
        
        public List<EmailAttachmentViewModel> ManualniPrilohy { get; set; } = new List<EmailAttachmentViewModel>();
        public List<EmailAttachmentViewModel> SystemovePrilohy { get; set; } = new List<EmailAttachmentViewModel>();
        public List<EmailAttachmentViewModel> CloudPrilohy { get; set; } = new List<EmailAttachmentViewModel>();
    }
    
    public class EmailAttachmentViewModel
    {
        public string NazevSouboru { get; set; }
        public string CestaSouboru { get; set; }
        public long VelikostSouboru { get; set; }
        public bool JeVybrana { get; set; }
        public string TypPrilohy { get; set; } // Manual, System, Cloud
    }
}
