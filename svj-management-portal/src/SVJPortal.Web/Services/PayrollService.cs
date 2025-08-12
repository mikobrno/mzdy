using Microsoft.EntityFrameworkCore;
using SVJPortal.Core.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.ViewModels;
using System.Globalization;
using System.Text;
using System.Xml;

namespace SVJPortal.Web.Services
{
    public class PayrollService : IPayrollService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditService _auditService;

        public PayrollService(ApplicationDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<Payroll>> GetPayrollsAsync(int svjId, int year, int month)
        {
            return await _context.Payrolls
                .Include(p => p.Employee)
                .Include(p => p.SVJ)
                .Where(p => p.SVJId == svjId && p.Rok == year && p.Mesic == month)
                .OrderBy(p => p.Employee.Prijmeni)
                .ThenBy(p => p.Employee.Jmeno)
                .ToListAsync();
        }

        public async Task<Payroll> GetPayrollByIdAsync(int id)
        {
            return await _context.Payrolls
                .Include(p => p.Employee)
                .Include(p => p.SVJ)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Payroll> CreatePayrollAsync(Payroll payroll)
        {
            payroll.DatumVytvoreni = DateTime.Now;
            _context.Payrolls.Add(payroll);
            await _context.SaveChangesAsync();
            
            await _auditService.LogChangeAsync("Payroll", payroll.Id.ToString(), "CREATE", null, payroll, "System");
            
            return payroll;
        }

        public async Task<Payroll> UpdatePayrollAsync(Payroll payroll)
        {
            var oldPayroll = await _context.Payrolls.AsNoTracking().FirstOrDefaultAsync(p => p.Id == payroll.Id);
            
            _context.Entry(payroll).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            await _auditService.LogChangeAsync("Payroll", payroll.Id.ToString(), "UPDATE", oldPayroll, payroll, "System");
            
            return payroll;
        }

        public async Task<bool> DeletePayrollAsync(int id)
        {
            var payroll = await _context.Payrolls.FindAsync(id);
            if (payroll != null)
            {
                _context.Payrolls.Remove(payroll);
                await _context.SaveChangesAsync();
                
                await _auditService.LogChangeAsync("Payroll", id.ToString(), "DELETE", payroll, null, "System");
                
                return true;
            }
            return false;
        }

        public async Task<bool> GenerateMonthlyPayrollsAsync(int year, int month)
        {
            var activeEmployees = await _context.Employees
                .Include(e => e.SVJ)
                .Where(e => e.JeAktivni && (e.DatumUkonceni == null || e.DatumUkonceni >= new DateTime(year, month, 1)))
                .ToListAsync();

            foreach (var employee in activeEmployees)
            {
                // Zkontrolujeme, zda již neexistuje mzda pro daný měsíc
                var existingPayroll = await _context.Payrolls
                    .FirstOrDefaultAsync(p => p.EmployeeId == employee.Id && p.Rok == year && p.Mesic == month);

                if (existingPayroll == null)
                {
                    // Najdeme předchozí mzdu jako šablonu
                    var previousPayroll = await _context.Payrolls
                        .Where(p => p.EmployeeId == employee.Id)
                        .OrderByDescending(p => p.Rok)
                        .ThenByDescending(p => p.Mesic)
                        .FirstOrDefaultAsync();

                    var newPayroll = new Payroll
                    {
                        EmployeeId = employee.Id,
                        SVJId = employee.SVJId,
                        Rok = year,
                        Mesic = month,
                        HrubaMzda = previousPayroll?.HrubaMzda ?? employee.VyseOdmeny,
                        ExekuceSrazky = previousPayroll?.ExekuceSrazky ?? employee.ExekuceSrazky ?? 0,
                        Stav = StavMzdyEnum.Pripravena,
                        DatumVytvoreni = DateTime.Now
                    };

                    // Vypočítáme odvody a daně
                    await CalculatePayrollAmountsAsync(newPayroll, employee);
                    
                    await CreatePayrollAsync(newPayroll);
                }
            }

            return true;
        }

        public async Task<PayrollEditViewModel> CalculatePayrollAsync(PayrollEditViewModel model)
        {
            await CalculatePayrollAmountsAsync(model.Payroll, model.Employee);
            
            // Kontrola DPP limitu
            if (model.Employee.TypUvazku == TypUvazkuEnum.DPP)
            {
                var yearlyDppSum = await _context.Payrolls
                    .Where(p => p.EmployeeId == model.Employee.Id && p.Rok == model.Payroll.Rok && p.Id != model.Payroll.Id)
                    .SumAsync(p => p.HrubaMzda);

                const decimal dppLimit = 10000; // Aktuální limit pro DPP
                model.ZbyvajiciDPPLimit = dppLimit - yearlyDppSum;
                model.JeDPPLimit = (yearlyDppSum + model.Payroll.HrubaMzda) > dppLimit;
            }

            return model;
        }

        public async Task<bool> ApprovePayrollsAsync(int svjId, int year, int month, string approvedBy)
        {
            var payrolls = await _context.Payrolls
                .Where(p => p.SVJId == svjId && p.Rok == year && p.Mesic == month && p.Stav == StavMzdyEnum.Hotova)
                .ToListAsync();

            foreach (var payroll in payrolls)
            {
                payroll.Stav = StavMzdyEnum.Schvalena;
                payroll.DatumSchvaleni = DateTime.Now;
                payroll.SchvalenoUzivatelem = approvedBy;
            }

            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<byte[]> GeneratePayrollSlipPdfAsync(int payrollId)
        {
            var payroll = await GetPayrollByIdAsync(payrollId);
            if (payroll == null) return null;

            // Zde by byla implementace generování PDF pomocí knihovny jako iTextSharp nebo PdfSharp
            // Pro zjednodušení vrátím prázdný byte array
            
            var pdfContent = GeneratePayrollSlipContent(payroll);
            return Encoding.UTF8.GetBytes(pdfContent);
        }

        public async Task<byte[]> GenerateBankTransferFileAsync(int svjId, int year, int month)
        {
            var payrolls = await GetPayrollsAsync(svjId, year, month);
            var approvedPayrolls = payrolls.Where(p => p.Stav == StavMzdyEnum.Schvalena).ToList();
            
            if (!approvedPayrolls.Any()) return null;

            var xml = GenerateBankTransferXml(approvedPayrolls);
            return Encoding.UTF8.GetBytes(xml);
        }

        public async Task<byte[]> GenerateCsszXmlAsync(int svjId, int year, int month)
        {
            var payrolls = await GetPayrollsAsync(svjId, year, month);
            var approvedPayrolls = payrolls.Where(p => p.Stav == StavMzdyEnum.Schvalena).ToList();
            
            if (!approvedPayrolls.Any()) return null;

            var xml = GenerateCsszXml(approvedPayrolls);
            return Encoding.UTF8.GetBytes(xml);
        }

        public async Task<byte[]> GenerateHealthInsuranceXmlAsync(int svjId, int year, int month)
        {
            var payrolls = await GetPayrollsAsync(svjId, year, month);
            var approvedPayrolls = payrolls.Where(p => p.Stav == StavMzdyEnum.Schvalena).ToList();
            
            if (!approvedPayrolls.Any()) return null;

            var xml = GenerateHealthInsuranceXml(approvedPayrolls);
            return Encoding.UTF8.GetBytes(xml);
        }

        private async Task CalculatePayrollAmountsAsync(Payroll payroll, Employee employee)
        {
            var hrubaMzda = payroll.HrubaMzda;
            
            // Sociální pojištění (6.5% zaměstnanec)
            payroll.SocialniPojisteni = Math.Round(hrubaMzda * 0.065m, 2);
            
            // Zdravotní pojištění (4.5% zaměstnanec)
            payroll.ZdravotniPojisteni = Math.Round(hrubaMzda * 0.045m, 2);
            
            // Výpočet daně z příjmu
            var zjednodusenyZdravotniOdpocet = hrubaMzda * 0.045m;
            var zjednodusenyOdvodOdpocet = hrubaMzda * 0.065m;
            var zdanitelnyPrijem = hrubaMzda - zjednodusenyZdravotniOdpocet - zjednodusenyOdvodOdpocet;
            
            decimal dan = 0;
            if (employee.TypUvazku != TypUvazkuEnum.DPP || zdanitelnyPrijem > 10000)
            {
                dan = Math.Round(zdanitelnyPrijem * 0.15m, 2); // 15% daň
                
                if (employee.RuzoveProhlaseni)
                {
                    dan = Math.Max(0, dan - 2570); // Sleva na poplatníka
                }
            }
            
            payroll.DanZPrijmu = dan;
            
            // Čistá mzda
            payroll.CistaMzda = hrubaMzda - payroll.SocialniPojisteni - payroll.ZdravotniPojisteni - payroll.DanZPrijmu - payroll.ExekuceSrazky;
            
            // Náklady zaměstnavatele (sociální 24.8% + zdravotní 9%)
            payroll.NakladyZamestnavatele = hrubaMzda + Math.Round(hrubaMzda * 0.248m, 2) + Math.Round(hrubaMzda * 0.09m, 2);
        }

        private string GeneratePayrollSlipContent(Payroll payroll)
        {
            return $@"
VÝPLATNÍ PÁSKA
==============
SVJ: {payroll.SVJ.Nazev}
Zaměstnanec: {payroll.Employee.CeleJmeno}
Období: {payroll.NazevMesice}

Hrubá mzda: {payroll.HrubaMzda:C}
Sociální pojištění: {payroll.SocialniPojisteni:C}
Zdravotní pojištění: {payroll.ZdravotniPojisteni:C}
Daň z příjmu: {payroll.DanZPrijmu:C}
Exekuce/srážky: {payroll.ExekuceSrazky:C}

ČISTÁ MZDA: {payroll.CistaMzda:C}
";
        }

        private string GenerateBankTransferXml(List<Payroll> payrolls)
        {
            var doc = new XmlDocument();
            var root = doc.CreateElement("BankTransfers");
            doc.AppendChild(root);

            foreach (var payroll in payrolls)
            {
                var transfer = doc.CreateElement("Transfer");
                transfer.SetAttribute("amount", payroll.CistaMzda.ToString(CultureInfo.InvariantCulture));
                transfer.SetAttribute("account", payroll.Employee.CisloUctu);
                transfer.SetAttribute("name", payroll.Employee.CeleJmeno);
                transfer.SetAttribute("message", $"Mzda {payroll.NazevMesice}");
                root.AppendChild(transfer);
            }

            return doc.OuterXml;
        }

        private string GenerateCsszXml(List<Payroll> payrolls)
        {
            // Implementace generování XML pro ČSSZ
            return "<CSSZ></CSSZ>";
        }

        private string GenerateHealthInsuranceXml(List<Payroll> payrolls)
        {
            // Implementace generování XML pro zdravotní pojišťovny
            return "<HealthInsurance></HealthInsurance>";
        }
    }
}