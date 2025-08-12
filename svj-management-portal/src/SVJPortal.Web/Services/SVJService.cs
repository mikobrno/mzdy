using Microsoft.EntityFrameworkCore;
using SVJPortal.Core.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.ViewModels;

namespace SVJPortal.Web.Services
{
    public class SVJService : ISVJService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditService _auditService;

        public SVJService(ApplicationDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<SVJ>> GetAllSVJsAsync()
        {
            return await _context.SVJs
                .Where(s => s.JeAktivni)
                .Include(s => s.Zamestnanci.Where(e => e.JeAktivni))
                .OrderBy(s => s.Nazev)
                .ToListAsync();
        }

        public async Task<SVJ> GetSVJByIdAsync(int id)
        {
            return await _context.SVJs
                .Include(s => s.Zamestnanci.Where(e => e.JeAktivni))
                .Include(s => s.Mzdy)
                .Include(s => s.EmailSablony)
                .FirstOrDefaultAsync(s => s.Id == id && s.JeAktivni);
        }

        public async Task<SVJ> GetSVJByIcoAsync(string ico)
        {
            return await _context.SVJs
                .FirstOrDefaultAsync(s => s.ICO == ico && s.JeAktivni);
        }

        public async Task<SVJ> CreateSVJAsync(SVJ svj)
        {
            svj.DatumVytvoreni = DateTime.Now;
            _context.SVJs.Add(svj);
            await _context.SaveChangesAsync();
            
            await _auditService.LogChangeAsync("SVJ", svj.Id.ToString(), "CREATE", null, svj, "System");
            
            return svj;
        }

        public async Task<SVJ> UpdateSVJAsync(SVJ svj)
        {
            var oldSvj = await _context.SVJs.AsNoTracking().FirstOrDefaultAsync(s => s.Id == svj.Id);
            
            svj.DatumPosledniUpravy = DateTime.Now;
            _context.Entry(svj).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            await _auditService.LogChangeAsync("SVJ", svj.Id.ToString(), "UPDATE", oldSvj, svj, "System");
            
            return svj;
        }

        public async Task<bool> DeleteSVJAsync(int id)
        {
            var svj = await _context.SVJs.FindAsync(id);
            if (svj != null)
            {
                svj.JeAktivni = false;
                await _context.SaveChangesAsync();
                
                await _auditService.LogChangeAsync("SVJ", id.ToString(), "DEACTIVATE", svj, null, "System");
                
                return true;
            }
            return false;
        }

        public async Task<DashboardViewModel> GetDashboardDataAsync()
        {
            var svjs = await GetAllSVJsAsync();
            var currentYear = DateTime.Now.Year;
            var currentMonth = DateTime.Now.Month;
            
            var viewModel = new DashboardViewModel
            {
                CelkemSVJ = svjs.Count(),
                AktivnichZamestnancu = svjs.Sum(s => s.Zamestnanci.Count()),
                SVJCards = new List<SVJCardViewModel>()
            };

            foreach (var svj in svjs)
            {
                var payrollsThisMonth = await _context.Payrolls
                    .Where(p => p.SVJId == svj.Id && p.Rok == currentYear && p.Mesic == currentMonth)
                    .CountAsync();

                viewModel.ZpracovanychMezdAktualneMesic += payrollsThisMonth;

                var card = new SVJCardViewModel
                {
                    Id = svj.Id,
                    Nazev = svj.Nazev,
                    RychlyPopis = svj.RychlyPopis,
                    ZpusobOdesilani = svj.ZpusobOdesilani,
                    KontaktniEmail = svj.Email,
                    PocetZamestnancu = svj.Zamestnanci.Count(),
                    StavMzedVRoce = await GetPayrollStatusForYearAsync(svj.Id, currentYear)
                };

                viewModel.SVJCards.Add(card);
            }

            return viewModel;
        }

        public async Task<SVJDetailViewModel> GetSVJDetailAsync(int id)
        {
            var svj = await GetSVJByIdAsync(id);
            if (svj == null) return null;

            return new SVJDetailViewModel
            {
                SVJ = svj,
                Zamestnanci = svj.Zamestnanci.ToList(),
                PosledniMzdy = svj.Mzdy.OrderByDescending(m => m.Rok).ThenByDescending(m => m.Mesic).Take(12).ToList(),
                EmailSablony = svj.EmailSablony.Where(e => e.JeAktivni).ToList(),
                StavMzedVRoce = await GetPayrollStatusForYearAsync(id, DateTime.Now.Year)
            };
        }

        public async Task<bool> ExistsByIcoAsync(string ico)
        {
            return await _context.SVJs.AnyAsync(s => s.ICO == ico && s.JeAktivni);
        }

        private async Task<MzdyStavViewModel[]> GetPayrollStatusForYearAsync(int svjId, int year)
        {
            var result = new MzdyStavViewModel[12];
            var payrolls = await _context.Payrolls
                .Where(p => p.SVJId == svjId && p.Rok == year)
                .ToListAsync();

            for (int i = 0; i < 12; i++)
            {
                var month = i + 1;
                var monthPayrolls = payrolls.Where(p => p.Mesic == month).ToList();
                
                result[i] = new MzdyStavViewModel
                {
                    Mesic = month,
                    JeZpracovana = monthPayrolls.Any(),
                    JeSchvalena = monthPayrolls.Any() && monthPayrolls.All(p => p.Stav == StavMzdyEnum.Schvalena || p.Stav == StavMzdyEnum.Vyplacena),
                    Stav = monthPayrolls.Any() ? monthPayrolls.First().Stav : StavMzdyEnum.Pripravena,
                    NazevMesice = new DateTime(year, month, 1).ToString("MMM", new System.Globalization.CultureInfo("cs-CZ"))
                };
            }

            return result;
        }
    }
}
