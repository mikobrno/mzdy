using Microsoft.AspNetCore.Mvc;
using SVJPortal.Web.Models.PdfForms;
using SVJPortal.Web.Services;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace SVJPortal.Web.Controllers
{
    [ApiController]
    [Route("api/pdf-templates")]

    public class PdfTemplateController : ControllerBase
    {
        private readonly PdfFormService _pdfFormService;
        // Simulace úložiště šablon a mapování (v produkci použít DB)
        private static List<PdfTemplate> _templates = new List<PdfTemplate>();
        private static List<PdfFieldMapping> _mappings = new List<PdfFieldMapping>();

        public PdfTemplateController()
        {
            _pdfFormService = new PdfFormService();
        }

        // POST: api/pdf-templates/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadTemplate([FromForm] PdfTemplateUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("Soubor není nahrán.");

            // Uložení souboru na disk (pro demo do temp složky)
            var fileName = Path.GetRandomFileName() + Path.GetExtension(dto.File.FileName);
            var filePath = Path.Combine(Path.GetTempPath(), fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            // Detekce polí
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                var fieldNames = await _pdfFormService.DetectFieldsAsync(stream);
                var template = new PdfTemplate
                {
                    Id = _templates.Count + 1,
                    Name = dto.Name,
                    FilePath = filePath,
                    Fields = fieldNames.ConvertAll(f => new PdfField { FieldName = f })
                };
                _templates.Add(template);
                return Ok(template);
            }
        }

        // GET: api/pdf-templates
        [HttpGet]
        public ActionResult<List<PdfTemplate>> GetTemplates()
        {
            return Ok(_templates);
        }

        // GET: api/pdf-templates/{id}/fields
        [HttpGet("{id}/fields")]
        public ActionResult<List<PdfField>> GetFields(int id)
        {
            var template = _templates.Find(t => t.Id == id);
            if (template == null) return NotFound();
            return Ok(template.Fields);
        }

        // POST: api/pdf-templates/{id}/mapping
        [HttpPost("{id}/mapping")]
        public IActionResult SaveMapping(int id, [FromBody] PdfFieldMappingDto dto)
        {
            // Smazat staré mapování pro šablonu
            _mappings.RemoveAll(m => m.TemplateId == id);
            // Přidat nové mapování
            foreach (var item in dto.Mappings)
            {
                _mappings.Add(new PdfFieldMapping
                {
                    Id = _mappings.Count + 1,
                    TemplateId = id,
                    PdfFieldName = item.PdfFieldName,
                    SystemVariable = item.SystemVariable
                });
            }
            return Ok();
        }

        // POST: api/pdf-templates/generate
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateFilledPdf([FromBody] GeneratePdfRequestDto dto)
        {
            var template = _templates.Find(t => t.Id == dto.TemplateId);
            if (template == null) return NotFound();

            // Získání mapování pro šablonu
            var mappings = _mappings.FindAll(m => m.TemplateId == dto.TemplateId);

            // Simulace získání dat z DB (v produkci načíst skutečná data)
            var data = new Dictionary<string, string>
            {
                { "text_ico", "12345678" },
                { "text_nazev_firmy", "SVJ Novákova" },
                { "obdobi", "08/2025" },
                { "vym_zaklad", "50000" },
                { "castka_pojistne", "6750" }
            };

            // Mapování systémových proměnných na hodnoty
            var fieldValues = new Dictionary<string, string>();
            foreach (var map in mappings)
            {
                // V produkci zde nahradit hodnoty podle mapování a skutečných dat
                if (data.TryGetValue(map.PdfFieldName, out var value))
                {
                    fieldValues[map.PdfFieldName] = value;
                }
            }

            // Vyplnění PDF
            using (var stream = new FileStream(template.FilePath, FileMode.Open, FileAccess.Read))
            {
                var filledPdf = await _pdfFormService.FillPdfAsync(stream, fieldValues);
                return File(filledPdf, "application/pdf", "vyplneny-formular.pdf");
            }
        }
    }

    // DTO pro generování PDF
    public class GeneratePdfRequestDto
    {
        public int PayrollId { get; set; }
        public int TemplateId { get; set; }
    }
}
