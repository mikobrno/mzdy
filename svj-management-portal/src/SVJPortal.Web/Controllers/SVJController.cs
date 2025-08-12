using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Models.ViewModels;

namespace SVJPortal.Web.Controllers
{
    [Authorize]
    public class SVJController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ISVJService _svjService;
        private readonly IAuditService _auditService;

        public SVJController(ApplicationDbContext context, ISVJService svjService, IAuditService auditService)
        {
            _context = context;
            _svjService = svjService;
            _auditService = auditService;
        }

        public async Task<IActionResult> Index()
        {
            var svjs = await _context.SVJs
                .Include(s => s.Zamestnanci)
                .Include(s => s.Mzdy)
                .OrderBy(s => s.Nazev)
                .ToListAsync();

            var viewModel = new SVJIndexViewModel
            {
                SVJs = svjs
            };

            return View(viewModel);
        }

        public async Task<IActionResult> Details(int id)
        {
            var svj = await _context.SVJs
                .Include(s => s.Zamestnanci)
                .Include(s => s.Mzdy)
                    .ThenInclude(p => p.Employee)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (svj == null)
            {
                TempData["ErrorMessage"] = "SVJ nebyl nalezen.";
                return RedirectToAction(nameof(Index));
            }

            var viewModel = new SVJDetailViewModel
            {
                SVJ = svj,
                PosledniMzdy = svj.Mzdy
                    .OrderByDescending(p => new DateTime(p.Rok, p.Mesic, 1))
                    .Take(10)
                    .ToList(),
                Zamestnanci = svj.Zamestnanci
                    .Where(e => e.DatumUkonceni == null)
                    .OrderBy(e => e.Prijmeni)
                    .ThenBy(e => e.Jmeno)
                    .ToList()
            };

            return View(viewModel);
        }

        [Authorize(Policy = "HlavniUcetniOrHigher")]
        public IActionResult Create()
        {
            return View(new SVJ());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Policy = "HlavniUcetniOrHigher")]
        public async Task<IActionResult> Create(SVJ svj)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Kontrola unikátnosti IČO
                    var existingIco = await _context.SVJs
                        .AnyAsync(s => s.ICO == svj.ICO);
                    
                    if (existingIco)
                    {
                        ModelState.AddModelError("ICO", "SVJ s tímto IČO již existuje.");
                        return View(svj);
                    }

                    svj.DatumVytvoreni = DateTime.Now;

                    _context.SVJs.Add(svj);
                    await _context.SaveChangesAsync();

                    await _auditService.LogAsync(
                        "SVJ_CREATE",
                        $"Vytvořeno nové SVJ: {svj.Nazev} (IČO: {svj.ICO})",
                        User.Identity?.Name,
                        svj.Id.ToString()
                    );

                    TempData["SuccessMessage"] = $"SVJ '{svj.Nazev}' bylo úspěšně vytvořeno.";
                    return RedirectToAction(nameof(Details), new { id = svj.Id });
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "Chyba při vytváření SVJ: " + ex.Message);
                }
            }

            return View(svj);
        }

        [Authorize(Policy = "HlavniUcetniOrHigher")]
        public async Task<IActionResult> Edit(int id)
        {
            var svj = await _context.SVJs.FindAsync(id);
            if (svj == null)
            {
                TempData["ErrorMessage"] = "SVJ nebyl nalezen.";
                return RedirectToAction(nameof(Index));
            }

            return View(svj);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Policy = "HlavniUcetniOrHigher")]
        public async Task<IActionResult> Edit(int id, SVJ svj)
        {
            if (id != svj.Id)
            {
                TempData["ErrorMessage"] = "Neplatný požadavek.";
                return RedirectToAction(nameof(Index));
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var existingSvj = await _context.SVJs.FindAsync(id);
                    if (existingSvj == null)
                    {
                        TempData["ErrorMessage"] = "SVJ nebyl nalezen.";
                        return RedirectToAction(nameof(Index));
                    }

                    // Kontrola unikátnosti IČO (kromě aktuálního SVJ)
                    var existingIco = await _context.SVJs
                        .AnyAsync(s => s.ICO == svj.ICO && s.Id != id);
                    
                    if (existingIco)
                    {
                        ModelState.AddModelError("ICO", "SVJ s tímto IČO již existuje.");
                        return View(svj);
                    }

                    // Aktualizace hodnot
                    existingSvj.Nazev = svj.Nazev;
                    existingSvj.ICO = svj.ICO;
                    // DIC not present on model; ignore if not used
                    existingSvj.Adresa = svj.Adresa;
                    // Mesto/PSC not defined in this model version
                    existingSvj.Email = svj.Email;
                    existingSvj.IBAN = svj.IBAN;
                    existingSvj.DatovaSchranka = svj.DatovaSchranka;

                    await _context.SaveChangesAsync();

                    await _auditService.LogAsync(
                        "SVJ_UPDATE",
                        $"Aktualizováno SVJ: {svj.Nazev} (IČO: {svj.ICO})",
                        User.Identity?.Name,
                        svj.Id.ToString()
                    );

                    TempData["SuccessMessage"] = $"SVJ '{svj.Nazev}' bylo úspěšně aktualizováno.";
                    return RedirectToAction(nameof(Details), new { id = svj.Id });
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "Chyba při aktualizaci SVJ: " + ex.Message);
                }
            }

            return View(svj);
        }

        [HttpGet]
        public async Task<IActionResult> GetSVJStats(int id)
        {
            try
            {
                var stats = await _svjService.GetSVJStatsAsync(id);
                return Json(stats);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GenerateMonthlyReport(int svjId, int year, int month)
        {
            try
            {
                var report = await _svjService.GenerateMonthlyReportAsync(svjId, year, month);
                
                return File(report, "application/pdf", $"SVJ_Report_{year}_{month:00}.pdf");
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Chyba při generování reportu: " + ex.Message;
                return RedirectToAction(nameof(Details), new { id = svjId });
            }
        }
    }
}