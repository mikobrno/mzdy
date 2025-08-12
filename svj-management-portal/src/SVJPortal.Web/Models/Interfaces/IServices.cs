using SVJPortal.Web.Models;
using SVJPortal.Web.Models.ViewModels;

namespace SVJPortal.Web.Models.Interfaces
{
    public interface ISVJService
    {
        Task<IEnumerable<SVJ>> GetAllSVJsAsync();
        Task<SVJ?> GetSVJByIdAsync(int id);
        Task<SVJ?> GetSVJByIcoAsync(string ico);
        Task<SVJ> CreateSVJAsync(SVJ svj);
        Task<SVJ> UpdateSVJAsync(SVJ svj);
        Task<bool> DeleteSVJAsync(int id);

        Task<DashboardViewModel> GetDashboardDataAsync();
        Task<SVJDetailViewModel?> GetSVJDetailAsync(int id);
        Task<bool> ExistsByIcoAsync(string ico);

        // Used by controller actions
        Task<object> GetSVJStatsAsync(int id);
        Task<byte[]> GenerateMonthlyReportAsync(int svjId, int year, int month);
    }
    
    public interface IEmployeeService
    {
        Task<IEnumerable<Employee>> GetEmployeesBySVJAsync(int svjId);
        Task<Employee?> GetEmployeeByIdAsync(int id);
        Task<Employee> CreateEmployeeAsync(Employee employee);
        Task<Employee> UpdateEmployeeAsync(Employee employee);
        Task<bool> DeleteEmployeeAsync(int id);

        Task<bool> TerminateEmployeeAsync(int id, DateTime terminationDate);
        Task<IEnumerable<Employee>> GetActiveEmployeesAsync();
        Task<bool> ExistsByRodneCisloAsync(string rodneCislo);
    }
    
    public interface IPayrollService
    {
        Task<IEnumerable<Payroll>> GetPayrollsAsync(int svjId, int year, int month);
        Task<IEnumerable<Payroll>> GetPayrollsBySVJIdAsync(int svjId);
        Task<Payroll?> GetPayrollByIdAsync(int id);
        Task<Payroll> CreatePayrollAsync(Payroll payroll);
        Task<Payroll> UpdatePayrollAsync(Payroll payroll);
        Task<bool> DeletePayrollAsync(int id);

        Task<bool> GenerateMonthlyPayrollsAsync(int year, int month);
        Task<bool> ApprovePayrollsAsync(int svjId, int year, int month, string approvedBy);

        Task<PayrollEditViewModel> CalculatePayrollAsync(PayrollEditViewModel model);
        Task<byte[]> GeneratePayrollSlipPdfAsync(int payrollId);
        Task<byte[]> GenerateBankTransferFileAsync(int svjId, int year, int month);
        Task<byte[]> GenerateCsszXmlAsync(int svjId, int year, int month);
        Task<byte[]> GenerateHealthInsuranceXmlAsync(int svjId, int year, int month);
    }
    
    public interface IAuditService
    {
        Task LogChangeAsync(string tableName, string recordId, string action, object oldValues, object newValues, string userId);
        Task<IEnumerable<AuditLog>> GetAuditLogsAsync(string tableName = null, string recordId = null, DateTime? from = null, DateTime? to = null);
        Task<IEnumerable<AuditLog>> GetEntityAuditLogsAsync(int entityId, string entityType);

        // Simplified wrapper used by controllers
        Task LogAsync(string action, string message, string userName, string recordId);
    }
    
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body, List<EmailAttachment> attachments = null);
        Task<bool> SendEmailFromTemplateAsync(int templateId, int svjId, Dictionary<string, string> variables = null);
        Task<EmailTemplate> CreateTemplateAsync(EmailTemplate template);
        Task<EmailTemplate> UpdateTemplateAsync(EmailTemplate template);
        Task<IEnumerable<EmailTemplate>> GetTemplatesAsync(int? svjId = null);
        Task<string> ProcessTemplateAsync(string template, Dictionary<string, string> variables);
        Task<List<EmailAttachment>> LoadCloudAttachmentsAsync(int svjId);
    }
    
    public interface IBankApiService
    {
        Task<bool> SendFioTransferAsync(byte[] transferFile);
        Task<bool> SendCeskaSporitelnaTransferAsync(byte[] transferFile);
        Task<bool> SendCsobTransferAsync(byte[] transferFile);
        Task<bool> SendKomercniBankaTransferAsync(byte[] transferFile);
        Task<bool> SendRaiffeisenBankTransferAsync(byte[] transferFile);
        Task<decimal> GetAccountBalanceAsync(string bankCode, string accountNumber);
    }
}
