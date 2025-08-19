using System.Collections.Generic;

namespace SVJPortal.Web.Models.PdfForms
{
    // Model šablony PDF
    public class PdfTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; } // Název šablony
        public string FilePath { get; set; } // Cesta k PDF souboru
        public List<PdfField> Fields { get; set; } = new List<PdfField>();
    }

    // Model pole v PDF
    public class PdfField
    {
        public string FieldName { get; set; } // Název pole v PDF
    }

    // Mapování pole na proměnnou systému
    public class PdfFieldMapping
    {
        public int Id { get; set; }
        public int TemplateId { get; set; }
        public string PdfFieldName { get; set; }
        public string SystemVariable { get; set; } // Např. {{svj.ico}}
    }
}
