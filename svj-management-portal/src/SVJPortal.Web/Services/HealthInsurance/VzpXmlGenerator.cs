using System.Text;
using SVJPortal.Web.Services.HealthInsurance;

namespace SVJPortal.Web.Services.HealthInsurance
{
    // Generátor XML pro VZP (PVPOJ)
    public class VzpXmlGenerator : IHealthInsuranceXmlGenerator
    {
        public string ExportType => "VZP";

        public byte[] GenerateXml(HealthInsuranceExportData data)
        {
            // Jednoduchý příklad XML, v praxi použít přesnou specifikaci VZP
            var sb = new StringBuilder();
            sb.AppendLine("<PVPOJ>");
            sb.AppendLine($"  <ICO>{data.CompanyIco}</ICO>");
            sb.AppendLine($"  <Obdobi>{data.Period}</Obdobi>");
            sb.AppendLine($"  <Zaklad>{data.TotalBase}</Zaklad>");
            sb.AppendLine($"  <Pojistne>{data.TotalInsurance}</Pojistne>");
            sb.AppendLine("  <Zamestnanci>");
            foreach (var emp in data.Employees)
            {
                sb.AppendLine("    <Zamestnanec>");
                sb.AppendLine($"      <Jmeno>{emp.Name}</Jmeno>");
                sb.AppendLine($"      <RodneCislo>{emp.BirthNumber}</RodneCislo>");
                sb.AppendLine($"      <Zaklad>{emp.Base}</Zaklad>");
                sb.AppendLine($"      <Pojistne>{emp.Insurance}</Pojistne>");
                sb.AppendLine("    </Zamestnanec>");
            }
            sb.AppendLine("  </Zamestnanci>");
            sb.AppendLine("</PVPOJ>");
            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
