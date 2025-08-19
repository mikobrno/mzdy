using System.Collections.Generic;
using System.Linq;
using SVJPortal.Web.Models.HealthInsurance;
using SVJPortal.Web.Services.HealthInsurance;

namespace SVJPortal.Web.Services.HealthInsurance
{
    public class HealthInsuranceExportService
    {
        private readonly List<IHealthInsuranceXmlGenerator> _generators;
        private readonly List<HealthInsuranceCompany> _companies;

        public HealthInsuranceExportService(List<IHealthInsuranceXmlGenerator> generators, List<HealthInsuranceCompany> companies)
        {
            _generators = generators;
            _companies = companies;
        }

        public List<HealthInsuranceExportResult> GenerateExports(int companyId, string period)
        {
            // 1. Zjistit unikátní pojišťovny pro firmu a období (simulace)
            var insuranceCompanies = _companies.Where(c => c.Id == companyId).ToList();
            var results = new List<HealthInsuranceExportResult>();

            foreach (var insurance in insuranceCompanies)
            {
                // 2. Agregace dat (simulace)
                var employees = new List<Models.HealthInsurance.HealthInsuranceEmployee>
                {
                    new Models.HealthInsurance.HealthInsuranceEmployee { Name = "Jan Novak", BirthNumber = "800101/1234", InsuranceCode = insurance.Code, Base = 25000, Insurance = 3375 },
                    new Models.HealthInsurance.HealthInsuranceEmployee { Name = "Petr Svoboda", BirthNumber = "790202/5678", InsuranceCode = insurance.Code, Base = 25000, Insurance = 3375 }
                };
                var data = new HealthInsuranceExportData
                {
                    CompanyName = "SVJ Novákova",
                    CompanyIco = "12345678",
                    Period = period,
                    InsuranceCode = insurance.Code,
                    TotalBase = employees.Sum(e => e.Base),
                    TotalInsurance = employees.Sum(e => e.Insurance),
                    Employees = employees
                };
                // 3. Najít správný generátor
                var generator = _generators.FirstOrDefault(g => g.ExportType == insurance.XmlExportType);
                byte[] xml = generator != null ? generator.GenerateXml(data) : null;

                // 4. (Návrh) Generování PDF - zde pouze návrh, implementace závisí na napojení na PDF modul
                byte[] pdf = null;
                if (insurance.PdfTemplateId.HasValue)
                {
                    // pdf = _pdfExportService.GenerateFilledPdf(insurance.PdfTemplateId.Value, data);
                }

                results.Add(new HealthInsuranceExportResult
                {
                    InsuranceName = insurance.Name,
                    InsuranceCode = insurance.Code,
                    TotalBase = data.TotalBase,
                    TotalInsurance = data.TotalInsurance,
                    XmlFile = xml,
                    PdfTemplateId = insurance.PdfTemplateId,
                    PdfFile = pdf
                });
            }
            return results;
        }
    }

    public class HealthInsuranceExportResult
    {
        public string InsuranceName { get; set; }
        public string InsuranceCode { get; set; }
        public decimal TotalBase { get; set; }
        public decimal TotalInsurance { get; set; }
        public byte[] XmlFile { get; set; }
        public int? PdfTemplateId { get; set; }
        public byte[] PdfFile { get; set; } // Volitelně vygenerovaný PDF soubor
    }
}
