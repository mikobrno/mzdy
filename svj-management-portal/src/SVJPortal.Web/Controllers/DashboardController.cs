using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SVJPortal.Core.Interfaces;
using SVJPortal.Web.Models.ViewModels;

namespace SVJPortal.Web.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly ISVJService _svjService;
        private readonly IPayrollService _payrollService;

        public DashboardController(ISVJService svjService, IPayrollService payrollService)
        {
            _svjService = svjService;
            _payrollService = payrollService;
        }

        public async Task<IActionResult> Index()
        {
            var dashboardData = await _svjService.GetDashboardDataAsync();
            return View(dashboardData);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateNote(string note)
        {
            // Zde by byla implementace pro uložení uživatelské poznámky
            // Pro zjednodušení jen vraciame success
            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> GenerateMonthlyPayrolls(int year, int month)
        {
            if (!User.IsInRole("HlavniUcetni") && !User.IsInRole("SuperAdministrator"))
            {
                return Forbid();
            }

            var success = await _payrollService.GenerateMonthlyPayrollsAsync(year, month);
            
            if (success)
            {
                TempData["SuccessMessage"] = $"Mzdy pro {month}/{year} byly úspěšně vygenerovány.";
            }
            else
            {
                TempData["ErrorMessage"] = "Při generování mezd došlo k chybě.";
            }

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> SVJDetail(int id)
        {
            var svjDetail = await _svjService.GetSVJDetailAsync(id);
            if (svjDetail == null)
            {
                return NotFound();
            }

            return View(svjDetail);
        }
    }
}