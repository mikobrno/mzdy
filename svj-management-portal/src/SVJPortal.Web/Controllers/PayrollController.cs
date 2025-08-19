using Microsoft.AspNetCore.Mvc;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.Interfaces;
using System.Threading.Tasks;
using System.Text;
using System.IO;

namespace SVJPortal.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
    private readonly IPayrollService _payrollService;

    public PayrollController(IPayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpGet("{svjId}")]
        public async Task<IActionResult> GetPayrolls(int svjId)
        {
            var payrolls = await _payrollService.GetPayrollsBySVJIdAsync(svjId);
            return Ok(payrolls);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayroll([FromBody] Payroll payroll)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _payrollService.CreatePayrollAsync(payroll);
            return CreatedAtAction(nameof(GetPayrolls), new { svjId = payroll.SVJId }, payroll);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayroll(int id, [FromBody] Payroll payroll)
        {
            if (id != payroll.Id || !ModelState.IsValid)
            {
                return BadRequest();
            }

            await _payrollService.UpdatePayrollAsync(payroll);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayroll(int id)
        {
            await _payrollService.DeletePayrollAsync(id);
            return NoContent();
        }

        [HttpGet("ExportCsv")]
        public async Task<IActionResult> ExportCsv()
        {
            var payrolls = await _payrollService.GetAllPayrollsAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Rok,Měsíc,Hrubá mzda,Čistá mzda,Stav");

            foreach (var payroll in payrolls)
            {
                csv.AppendLine($"{payroll.Rok},{payroll.NazevMesice},{payroll.HrubaMzda},{payroll.CistaMzda},{payroll.Stav}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "payrolls.csv");
        }

        [HttpGet("ExportPdf")]
        public async Task<IActionResult> ExportPdf()
        {
            var payrolls = await _payrollService.GetAllPayrollsAsync();

            using var memoryStream = new MemoryStream();
            using (var writer = new StreamWriter(memoryStream, Encoding.UTF8, leaveOpen: true))
            {
                writer.WriteLine("Seznam mezd");
                writer.WriteLine("Rok\tMěsíc\tHrubá mzda\tČistá mzda\tStav");

                foreach (var payroll in payrolls)
                {
                    writer.WriteLine($"{payroll.Rok}\t{payroll.NazevMesice}\t{payroll.HrubaMzda}\t{payroll.CistaMzda}\t{payroll.Stav}");
                }
            }

            memoryStream.Position = 0;
            return File(memoryStream.ToArray(), "application/pdf", "payrolls.pdf");
        }

        [HttpPost("Recalculate/{id}")]
        public async Task<IActionResult> Recalculate(int id)
        {
            var payroll = await _payrollService.GetPayrollByIdAsync(id);
            if (payroll == null)
            {
                return NotFound();
            }

            // Mock calculation logic
            payroll.HrubaMzda += 1000; // Example adjustment
            payroll.CistaMzda = payroll.HrubaMzda - payroll.DanZPrijmu - payroll.SocialniPojisteni - payroll.ZdravotniPojisteni;

            await _payrollService.UpdatePayrollAsync(payroll);

            return RedirectToAction("Index");
        }
    }
}