using Microsoft.AspNetCore.Mvc;
using SVJPortal.Web.Models.HealthInsurance;
using SVJPortal.Web.Services.HealthInsurance;
using System.Collections.Generic;
using System.Linq;

namespace SVJPortal.Web.Controllers
{
    [ApiController]
    [Route("api/health-insurance")]
    public class HealthInsuranceController : ControllerBase
    {
        // Simulace úložiště pojišťoven a generátorů (v produkci použít DB a DI)
        private static List<HealthInsuranceCompany> _companies = new List<HealthInsuranceCompany>
        {
            new HealthInsuranceCompany { Id = 1, Name = "Všeobecná zdravotní pojišťovna", Code = "111", XmlExportType = "VZP", PdfTemplateId = 1 },
            new HealthInsuranceCompany { Id = 2, Name = "Zdravotní pojišťovna ministerstva vnitra ČR", Code = "211", XmlExportType = "ZPMV", PdfTemplateId = 2 }
        };
        private static List<IHealthInsuranceXmlGenerator> _generators = new List<IHealthInsuranceXmlGenerator>
        {
            new VzpXmlGenerator(),
            new ZpmvXmlGenerator()
        };
        private static HealthInsuranceExportService _exportService = new HealthInsuranceExportService(_generators, _companies);

        // GET: api/health-insurance/companies
        [HttpGet("companies")]
        public ActionResult<List<HealthInsuranceCompany>> GetCompanies()
        {
            return Ok(_companies);
        }

        // POST: api/health-insurance/companies
        [HttpPost("companies")]
        public IActionResult AddCompany([FromBody] HealthInsuranceCompany company)
        {
            company.Id = _companies.Max(c => c.Id) + 1;
            _companies.Add(company);
            return Ok(company);
        }

        // PUT: api/health-insurance/companies/{id}
        [HttpPut("companies/{id}")]
        public IActionResult UpdateCompany(int id, [FromBody] HealthInsuranceCompany company)
        {
            var existing = _companies.FirstOrDefault(c => c.Id == id);
            if (existing == null) return NotFound();
            existing.Name = company.Name;
            existing.Code = company.Code;
            existing.XmlExportType = company.XmlExportType;
            existing.PdfTemplateId = company.PdfTemplateId;
            return Ok(existing);
        }

        // DELETE: api/health-insurance/companies/{id}
        [HttpDelete("companies/{id}")]
        public IActionResult DeleteCompany(int id)
        {
            var existing = _companies.FirstOrDefault(c => c.Id == id);
            if (existing == null) return NotFound();
            _companies.Remove(existing);
            return Ok();
        }

        // POST: api/health-insurance/exports
        [HttpPost("exports")]
        public ActionResult<List<HealthInsuranceExportResult>> GenerateExports([FromBody] ExportRequestDto dto)
        {
            // V produkci: načíst zaměstnance, mzdy atd. podle companyId a period
            var results = _exportService.GenerateExports(dto.CompanyId, dto.Period);
            return Ok(results);
        }
    }

    public class ExportRequestDto
    {
        public int CompanyId { get; set; }
        public string Period { get; set; } // např. "08/2025"
    }
}
