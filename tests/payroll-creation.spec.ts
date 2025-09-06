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
  await email.fill('admin@example.com')
  await pass.fill('admin123')
  await page.getByRole('button', { name: /login|přihlásit/i }).click()
  await page.waitForFunction(() => {
    try { return Object.keys(localStorage).some(k => k.includes('auth-token') && localStorage.getItem(k)) } catch { return false }
  }, { timeout: 10000 }).catch(()=>{})
  if (/\/login$/.test(page.url())) {
    await page.goto('/')
  }
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
    await page.waitForLoadState('networkidle')
    // Helper to create employee directly if none exist
    async function ensureEmployee() {
  const possibleRow = page.locator('[data-test="employee-row"], .employee-row, table tr').filter({ has: page.locator('td') }).first()
      if (await possibleRow.count() > 0) return null
      // attempt UI navigation
      const newBtn = page.locator('a:has-text("Nový zaměstnanec"), a:has-text("Add Employee"), button:has-text("Přidat zaměstnance"), button:has-text("Add Employee"), a[href="/employees/new"], button:has-text("Nová osoba")').first()
      if (await newBtn.count()) {
        await newBtn.click()
      } else {
        await page.goto('/employees/new')
      }
      await page.waitForURL(/employees\/new/)
      const firstNameField = page.locator('[name="firstName"], input[name*="first" i]').first()
      const lastNameField = page.locator('[name="lastName"], input[name*="last" i]').first()
      await firstNameField.fill('Pay')
      await lastNameField.fill('Roll')
      const emailValue = `pay.roll.${Date.now()}@test.com`
      await page.locator('input[type="email"], input[name="email"]').first().fill(emailValue)
      const submit = page.locator('button:has-text("Uložit"), button:has-text("Save"), button:has-text("Create"), button:has-text("Vytvořit")').first()
      await submit.click()
      // After save might land on employees list OR detail page
      await page.waitForLoadState('networkidle')
      // If on detail page (URL has /employees/ + id) that's fine
      if (/\/employees\//.test(page.url())) {
        return { created: true, onDetail: true }
      }
      // else ensure list visible
      await page.waitForURL(/employees($|\?)/)
      return { created: true, onDetail: false }
    }
    await ensureEmployee()
    // Re-evaluate first employee presentation
  let firstRow = page.locator('[data-test="employee-row"], .employee-row').first()
    if (await firstRow.count() === 0) {
      firstRow = page.locator('table tr').filter({ has: page.locator('td') }).first()
    }
    // If still not found but we're already on a detail page, skip row selection
    let employeeName: string
    if (await firstRow.count() === 0 && /\/employees\//.test(page.url())) {
      // derive employee name from heading
      const heading = page.locator('h1, h2').first()
      employeeName = (await heading.innerText().catch(() => 'Pay Roll')).trim()
    } else {
      await expect(firstRow).toBeVisible()
      // Extract (best-effort) employee name for later verification
      employeeName = (await firstRow.innerText()).trim().split('\n')[0].trim()
      if (!employeeName || employeeName.length < 3) {
        const firstCell = await firstRow.locator('td').nth(0).innerText().catch(() => '')
        const secondCell = await firstRow.locator('td').nth(1).innerText().catch(() => '')
        employeeName = `${firstCell} ${secondCell}`.trim()
      }
      // Click detail/view button inside the row
      const viewBtn = firstRow.locator('a:has-text("Detail"), button:has-text("Detail"), a:has-text("View"), button:has-text("View")').first()
      if (await viewBtn.count()) {
        await viewBtn.click()
      } else {
        await firstRow.click()
      }
      await page.waitForURL(/\/employees\//, { timeout: 10000 })
    }

  // employeeName already resolved above

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
    await page.waitForLoadState('networkidle')
  let firstRow2 = page.locator('[data-test="employee-row"], .employee-row').first()
    if (await firstRow2.count() === 0) {
      firstRow2 = page.locator('table tr').filter({ has: page.locator('td') }).first()
    }
    if (await firstRow2.count() === 0) {
      // create one quickly
      await page.goto('/employees/new')
      await page.locator('[name="firstName"], input[name*="first" i]').first().fill('Validate')
      await page.locator('[name="lastName"], input[name*="last" i]').first().fill('Case')
      await page.locator('input[type="email"], input[name="email"]').first().fill(`validate.case.${Date.now()}@test.com`)
      const submit2 = page.locator('button:has-text("Uložit"), button:has-text("Save"), button:has-text("Create"), button:has-text("Vytvořit")').first()
      await submit2.click()
      await page.waitForLoadState('networkidle')
      if (!/\/employees\//.test(page.url())) {
        await page.goto('/employees')
      }
      firstRow2 = page.locator('.employee-row').first()
      if (await firstRow2.count() === 0) {
        firstRow2 = page.locator('table tr').filter({ has: page.locator('td') }).first()
      }
    }
    if (/\/employees\//.test(page.url())) {
      // already on detail after creation
    } else {
      await expect(firstRow2).toBeVisible()
      const viewBtn2 = firstRow2.locator('a:has-text("Detail"), button:has-text("Detail"), a:has-text("View"), button:has-text("View")').first()
      if (await viewBtn2.count()) {
        await viewBtn2.click()
      } else {
        await firstRow2.click()
      }
      await page.waitForURL(/\/employees\//, { timeout: 10000 })
    }

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
