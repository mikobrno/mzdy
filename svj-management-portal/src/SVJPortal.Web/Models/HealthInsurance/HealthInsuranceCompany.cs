namespace SVJPortal.Web.Models.HealthInsurance
{
    // Model zdravotní pojišťovny
    public class HealthInsuranceCompany
    {
        public int Id { get; set; }
        public string Name { get; set; } // Název pojišťovny
        public string Code { get; set; } // Kód pojišťovny (např. "111")
        public string XmlExportType { get; set; } // Typ XML exportu (např. "VZP", "ZPMV")
        public int? PdfTemplateId { get; set; } // Propojení na PDF šablonu
    }
}
