using System.Text;
using SVJPortal.Web.Services.HealthInsurance;

namespace SVJPortal.Web.Services.HealthInsurance
{
    // Generátor XML pro ZPMV
    public class ZpmvXmlGenerator : IHealthInsuranceXmlGenerator
    {
        public string ExportType => "ZPMV";

        public byte[] GenerateXml(HealthInsuranceExportData data)
        {
            // Jednoduchý příklad XML, v praxi použít přesnou specifikaci ZPMV
            var sb = new StringBuilder();
            sb.AppendLine("<ZPMV>");
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
                sb.AppendLine($"      <Zaklad>{emp.Base}");
                sb.AppendLine($"      <Pojistne>{emp.Insurance}");
                sb.AppendLine("    </Zamestnanec>");
            }
            sb.AppendLine("  </Zamestnanci>");
            sb.AppendLine("</ZPMV>");
            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
