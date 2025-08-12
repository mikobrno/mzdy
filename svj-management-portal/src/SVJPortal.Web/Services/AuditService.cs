using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SVJPortal.Web.Models.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Models;

namespace SVJPortal.Web.Services
{
    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _context;

        public AuditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogChangeAsync(string tableName, string recordId, string action, object oldValues, object newValues, string userId)
        {
            var auditLog = new AuditLog
            {
                NazevTabulky = tableName,
                IdZaznamu = recordId,
                Akce = action,
                PuvodniHodnoty = oldValues != null ? JsonConvert.SerializeObject(oldValues) : null,
                NoveHodnoty = newValues != null ? JsonConvert.SerializeObject(newValues) : null,
                DatumZmeny = DateTime.Now,
                Uzivatel = userId ?? "System"
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(string tableName = null, string recordId = null, DateTime? from = null, DateTime? to = null)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(tableName))
                query = query.Where(a => a.NazevTabulky == tableName);

            if (!string.IsNullOrEmpty(recordId))
                query = query.Where(a => a.IdZaznamu == recordId);

            if (from.HasValue)
                query = query.Where(a => a.DatumZmeny >= from.Value);

            if (to.HasValue)
                query = query.Where(a => a.DatumZmeny <= to.Value);

            return await query
                .OrderByDescending(a => a.DatumZmeny)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetEntityAuditLogsAsync(int entityId, string entityType)
        {
            return await _context.AuditLogs
                .Where(a => a.NazevTabulky == entityType && a.IdZaznamu == entityId.ToString())
                .OrderByDescending(a => a.DatumZmeny)
                .ToListAsync();
        }
    }
}
