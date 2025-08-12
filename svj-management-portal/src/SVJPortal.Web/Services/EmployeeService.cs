using Microsoft.EntityFrameworkCore;
using SVJPortal.Web.Models.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.ViewModels;

namespace SVJPortal.Web.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditService _auditService;

        public EmployeeService(ApplicationDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

    public async Task<IEnumerable<Employee>> GetEmployeesBySVJAsync(int svjId)
        {
            return await _context.Employees
        .Include(e => e.SVJ)
        .Where(e => e.SVJId == svjId && e.JeAktivni)
        .OrderBy(e => e.Prijmeni)
        .ThenBy(e => e.Jmeno)
                .ToListAsync();
        }

    public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            return await _context.Employees
                .Include(e => e.SVJ)
                .Include(e => e.Mzdy.OrderByDescending(m => m.Rok).ThenByDescending(m => m.Mesic))
                .FirstOrDefaultAsync(e => e.Id == id);
        }

    public async Task<Employee> CreateEmployeeAsync(Employee employee)
        {
            employee.DatumNastupu = employee.DatumNastupu == DateTime.MinValue ? DateTime.Now : employee.DatumNastupu;
            
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            
        await _auditService.LogChangeAsync("Employee", employee.Id.ToString(), "CREATE", null, employee, "System");
            
            return employee;
        }

    public async Task<Employee> UpdateEmployeeAsync(Employee employee)
        {
            var oldEmployee = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employee.Id);
            
            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            await _auditService.LogChangeAsync("Employee", employee.Id.ToString(), "UPDATE", oldEmployee, employee, "System");
            
            return employee;
        }

    public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee != null)
            {
                employee.JeAktivni = false;
                employee.DatumUkonceni = DateTime.Now;
                await _context.SaveChangesAsync();
                
                await _auditService.LogChangeAsync("Employee", id.ToString(), "DEACTIVATE", employee, null, "System");
                
                return true;
            }
            return false;
        }

    public async Task<bool> TerminateEmployeeAsync(int id, DateTime terminationDate)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee != null)
            {
                var oldEmployee = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
                
                employee.DatumUkonceni = terminationDate;
                employee.JeAktivni = false;
                
                await _context.SaveChangesAsync();
                
                await _auditService.LogChangeAsync("Employee", id.ToString(), "TERMINATE", oldEmployee, employee, "System");
                
                return true;
            }
            return false;
        }

    public async Task<IEnumerable<Employee>> GetActiveEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.SVJ)
                .Where(e => e.JeAktivni && (e.DatumUkonceni == null || e.DatumUkonceni > DateTime.Now))
                .OrderBy(e => e.SVJ.Nazev)
                .ThenBy(e => e.Prijmeni)
                .ThenBy(e => e.Jmeno)
                .ToListAsync();
        }

    public async Task<bool> ExistsByRodneCisloAsync(string rodneCislo)
        {
            return await _context.Employees.AnyAsync(e => e.RodneCislo == rodneCislo && e.JeAktivni);
        }
    }
}
