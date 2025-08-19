namespace SVJPortal.Web.Services.HealthInsurance
{
    // Společné rozhraní pro všechny generátory XML přehledů
    public interface IHealthInsuranceXmlGenerator
    {
        // Vrací vygenerovaný XML soubor jako byte[]
        byte[] GenerateXml(HealthInsuranceExportData data);
        string ExportType { get; } // např. "VZP", "ZPMV", "OZP", "VoZP"
    }

    // Datová struktura pro předání agregovaných dat do generátoru
    public class HealthInsuranceExportData
    {
        public string CompanyName { get; set; }
        public string CompanyIco { get; set; }
        public string Period { get; set; } // např. "08/2025"
        public string InsuranceCode { get; set; }
        public decimal TotalBase { get; set; }
        public decimal TotalInsurance { get; set; }
        // Další pole dle potřeby (např. seznam zaměstnanců)
    }
}
