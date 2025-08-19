using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace SVJPortal.Web.Models.PdfForms
{
    // DTO pro upload šablony
    public class PdfTemplateUploadDto
    {
        public string Name { get; set; }
        public IFormFile File { get; set; }
    }

    // DTO pro mapování polí
    public class PdfFieldMappingDto
    {
        public int TemplateId { get; set; }
        public List<PdfFieldMappingItem> Mappings { get; set; }
    }

    public class PdfFieldMappingItem
    {
        public string PdfFieldName { get; set; }
        public string SystemVariable { get; set; }
    }
}
