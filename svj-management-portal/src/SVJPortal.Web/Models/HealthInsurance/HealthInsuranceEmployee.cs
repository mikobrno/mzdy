using System.Collections.Generic;

namespace SVJPortal.Web.Models.HealthInsurance
{
    // Model zaměstnance pro exporty pojišťoven
    public class HealthInsuranceEmployee
    {
        public string Name { get; set; }
        public string BirthNumber { get; set; }
        public string InsuranceCode { get; set; }
        public decimal Base { get; set; }
        public decimal Insurance { get; set; }
    }

    // Rozšířená data pro export (včetně seznamu zaměstnanců)
    public class HealthInsuranceExportData
    {
        public string CompanyName { get; set; }
        public string CompanyIco { get; set; }
        public string Period { get; set; }
        public string InsuranceCode { get; set; }
        public decimal TotalBase { get; set; }
        public decimal TotalInsurance { get; set; }
        public List<HealthInsuranceEmployee> Employees { get; set; } = new List<HealthInsuranceEmployee>();
    }
}
