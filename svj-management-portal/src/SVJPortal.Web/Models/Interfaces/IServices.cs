using SVJPortal.Web.Models.Entities;

namespace SVJPortal.Web.Models.Interfaces
{
    public interface ISVJService
    {
        Task<IEnumerable<SVJ>> GetAllAsync();
        Task<SVJ?> GetByIdAsync(int id);
        Task<SVJ> CreateAsync(SVJ svj);
        Task<SVJ> UpdateAsync(SVJ svj);
        Task DeleteAsync(int id);
    }
    
    public interface IEmployeeService
    {
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<IEnumerable<Employee>> GetBySVJIdAsync(int svjId);
        Task<Employee?> GetByIdAsync(int id);
        Task<Employee> CreateAsync(Employee employee);
        Task<Employee> UpdateAsync(Employee employee);
        Task DeleteAsync(int id);
    }
    
    public interface IPayrollService
    {
        Task<IEnumerable<Payroll>> GetAllAsync();
        Task<IEnumerable<Payroll>> GetBySVJIdAsync(int svjId);
        Task<Payroll?> GetByIdAsync(int id);
        Task<Payroll> CreateAsync(Payroll payroll);
        Task<Payroll> UpdateAsync(Payroll payroll);
        Task DeleteAsync(int id);
        Task<Payroll> ApproveAsync(int id);
        Task<decimal> CalculateTotalSalaryAsync(int payrollId);
    }
    
    public interface IAuditService
    {
        Task LogAsync(string action, string entityType, int entityId, string? details = null);
        Task<IEnumerable<AuditLog>> GetLogsAsync(DateTime? from = null, DateTime? to = null);
    }
    
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendPayrollNotificationAsync(Payroll payroll);
    }
    
    public interface IBankApiService
    {
        Task<bool> ValidateBankAccountAsync(string accountNumber, string bankCode);
        Task<decimal> GetAccountBalanceAsync(string accountNumber, string bankCode);
    }
}
