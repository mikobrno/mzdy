using Microsoft.AspNetCore.Mvc;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.Interfaces;
using System.Threading.Tasks;

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
    }
}