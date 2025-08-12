using Microsoft.AspNetCore.Mvc;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.Interfaces;
using System.Threading.Tasks;

namespace SVJPortal.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
    private readonly IEmployeeService _employeeService;

    public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(id);
            if (employee == null)
            {
                return NotFound();
            }
            return Ok(employee);
        }

        [HttpPost]
        public async Task<ActionResult<Employee>> AddEmployee(Employee employee)
        {
            var createdEmployee = await _employeeService.CreateEmployeeAsync(employee);
            return CreatedAtAction(nameof(GetEmployee), new { id = createdEmployee.Id }, createdEmployee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.Id)
            {
                return BadRequest();
            }

            await _employeeService.UpdateEmployeeAsync(employee);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var result = await _employeeService.DeleteEmployeeAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}