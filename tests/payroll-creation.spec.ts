import { test, expect } from '@playwright/test'

// Payroll creation workflow test
// Assumptions / Fallbacks:
// - Employee list at /employees, rows identifiable by class .employee-row OR generic <tr>
// - Employee detail page has a button to start payroll: text matches (Create Payroll|New Payroll|Zpracovat mzdu|Zpracovat|Nová mzda)
// - Payroll creation form has inputs for gross salary & bonuses with various possible name attributes
// - After save, redirect to /payrolls (or /payroll) where a row shows employee name & gross amount
// - Test uses resilient selectors for multilingual labels

async function login(page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 })
  const email = page.locator('input[name="email"], input[type="email"]').first()
  const pass = page.locator('input[name="password"], input[type="password"]').first()
  await expect(email).toBeVisible()
  await email.fill('test@example.com')
  await pass.fill('password123')
  await page.getByRole('button', { name: /login|přihlásit/i }).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Payroll creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should create, save, and verify a new payroll for an employee', async ({ page }) => {
    // --- Network interception for Supabase payroll requests ---
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
    let supabaseRequestMade = false
    await page.route('**/rest/v1/payrolls**', async (route) => {
      const reqUrl = route.request().url()
      if ((SUPABASE_URL && reqUrl.startsWith(SUPABASE_URL)) || /rest\/v1\/payrolls/i.test(reqUrl)) {
        supabaseRequestMade = true
      }
      await route.continue()
    })
    // 1. Navigate & Select
    await page.goto('/employees')
    // Locate first employee row (robust fallback chain)
    const row = page.locator('.employee-row').first()
    const rowExists = await row.count()
    let firstRow = row
    if (rowExists === 0) {
      // fallback to any table row with at least one cell
      firstRow = page.locator('table tr').filter({ has: page.locator('td') }).first()
    }
    await expect(firstRow).toBeVisible()

    // Extract (best-effort) employee name for later verification
    let employeeName = (await firstRow.innerText()).trim().split('\n')[0].trim()
    if (!employeeName || employeeName.length < 3) {
      // fallback: attempt to combine first two cells
      const firstCell = await firstRow.locator('td').nth(0).innerText().catch(() => '')
      const secondCell = await firstRow.locator('td').nth(1).innerText().catch(() => '')
      employeeName = `${firstCell} ${secondCell}`.trim()
    }

    // Click detail/view button inside the row
    const viewBtn = firstRow.locator('a:has-text("Detail"), button:has-text("Detail"), a:has-text("View"), button:has-text("View")').first()
    await viewBtn.click()

    // Wait for navigation to employee detail (heuristic: URL contains /employees/ + id)
    await page.waitForURL(/\/employees\//, { timeout: 10000 })

    // 2. Initiate Payroll Creation
    const createPayrollBtn = page.locator('button:has-text("Create Payroll"), button:has-text("New Payroll"), button:has-text("Zpracovat mzdu"), button:has-text("Zpracovat"), button:has-text("Nová mzda"), a:has-text("Create Payroll"), a:has-text("New Payroll")').first()
    await expect(createPayrollBtn).toBeVisible()
    await createPayrollBtn.click()

    // Wait for new payroll form
    await page.waitForURL(/payrolls?\/new|payroll.*create/i, { timeout: 10000 })

    // 3. Fill Payroll Form
    // Optional month/year selectors (ignore if not present)
    const monthSelect = page.locator('select[name="month"], select[name*="month" i]')
    if (await monthSelect.count()) {
      await monthSelect.first().selectOption({ index: 0 }).catch(() => {})
    }
    const yearSelect = page.locator('select[name="year"], select[name*="year" i]')
    if (await yearSelect.count()) {
      await yearSelect.first().selectOption({ index: 0 }).catch(() => {})
    }

    // Gross salary input (various name variants)
    const grossInput = page.locator('input[name="gross_salary"], input[name="grossSalary"], input[name*="gross" i], input[name*="hrub" i]').first()
    await expect(grossInput).toBeVisible()
    await grossInput.fill('50000')

    const bonusesInput = page.locator('input[name="bonuses"], input[name*="bonus" i]').first()
    if (await bonusesInput.count()) {
      await bonusesInput.fill('5000')
    }

    const saveBtn = page.locator('button:has-text("Save Payroll"), button:has-text("Uložit mzdu"), button:has-text("Uložit"), button:has-text("Save")').first()
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()

    // 4. Verify Result
    await page.waitForURL(/\/payrolls?($|[?#])/, { timeout: 15000 })

    // Normalize employeeName (if extremely long, cut) - only use first two words to match typical listing
    const firstTwo = employeeName.split(/\s+/).slice(0, 2).join(' ').trim()

    // Look for row containing employee and gross value
    const payrollRow = page.locator(
      `tr:has-text("${firstTwo}"):has-text("50000"), div:has-text("${firstTwo}"):has-text("50000"), li:has-text("${firstTwo}"):has-text("50000")`
    ).first()
    await expect(payrollRow).toBeVisible()

    // 5. Open detail of the created payroll
    // Try clicking a link inside the row first (detail/view), fallback to row click
    const detailLink = payrollRow.locator('a:has-text("Detail"), a:has-text("View"), a[href*="payroll"], button:has-text("Detail"), button:has-text("View")').first()
    if (await detailLink.count()) {
      await detailLink.click()
    } else {
      await payrollRow.click()
    }

    // Wait for payroll detail page (heuristic: URL contains /payroll or /payrolls/ + id)
    await page.waitForURL(/payroll(s)?\/.+|\/payroll\//, { timeout: 10000 })

    // 6. Verify net salary (assumed calculation: gross 50000 + bonuses 5000 => net 44000 for test scenario)
  const netLocator = page.locator('.net-salary-value, [data-test="net-salary"], text=/44000/').first()
    await expect(netLocator).toBeVisible()
    await expect(netLocator).toContainText(/44000/)

  // Assert backend (Supabase) request happened
  expect(supabaseRequestMade).toBeTruthy()
  })

  test('should display validation errors when submitting an empty or invalid form', async ({ page }) => {
    // Reuse navigation steps: go to employees and open first employee detail
    await page.goto('/employees')
    let firstRow = page.locator('.employee-row').first()
    if (await firstRow.count() === 0) {
      firstRow = page.locator('table tr').filter({ has: page.locator('td') }).first()
    }
    await expect(firstRow).toBeVisible()
    const viewBtn = firstRow.locator('a:has-text("Detail"), button:has-text("Detail"), a:has-text("View"), button:has-text("View")').first()
    await viewBtn.click()
    await page.waitForURL(/\/employees\//, { timeout: 10000 })

    // Open payroll creation form
    const createPayrollBtn = page.locator('button:has-text("Create Payroll"), button:has-text("New Payroll"), button:has-text("Zpracovat mzdu"), button:has-text("Zpracovat"), button:has-text("Nová mzda"), a:has-text("Create Payroll"), a:has-text("New Payroll")').first()
    await expect(createPayrollBtn).toBeVisible()
    await createPayrollBtn.click()
    await page.waitForURL(/payrolls?\/new|payroll.*create/i, { timeout: 10000 })

    const saveBtn = page.locator('button:has-text("Save Payroll"), button:has-text("Uložit mzdu"), button:has-text("Uložit"), button:has-text("Save")').first()
    await expect(saveBtn).toBeVisible()

    // 1st submit empty
    await saveBtn.click()

    // Expect at least one validation error (role alert or common text)
    const errorLocator = page.locator('[role="alert"], .error, .text-red-500, text=/this field is required/i, text=/povinné/i')
    await expect(errorLocator.first()).toBeVisible()

    // Enter invalid non-numeric gross salary
    const grossInput = page.locator('input[name="gross_salary"], input[name="grossSalary"], input[name*="gross" i], input[name*="hrub" i]').first()
    await grossInput.fill('abc')
    await saveBtn.click()

    const numberError = page.locator('text=/valid number/i, text=/platné číslo/i, [data-test="error-gross-salary"]')
    await expect(numberError.first()).toBeVisible()
  })
})
