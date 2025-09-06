import { test, expect } from '@playwright/test'

// Full end-to-end journey:
// 1. Login
// 2. Create SVJ
// 3. Create Employee under that SVJ
// 4. Create first Payroll
// 5. Download payslip PDF
// Assumptions: selectors may vary -> use resilient multi-language / fallback strategies.

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

function unique(label: string) { return `${label} ${Date.now()}` }

// Helper: find row containing text
async function findRow(page, text: string) {
  const locator = page.locator(`tr:has-text("${text}"), li:has-text("${text}"), div:has-text("${text}")`).first()
  await expect(locator).toBeVisible()
  return locator
}

test.describe('Full Journey', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should onboard a new SVJ, process first payroll, and download payslip', async ({ page }) => {
    // 2. Create a new SVJ
    await page.goto('/svj')
    const svjName = unique('Test SVJ')
    const addSvjBtn = page.locator('button:has-text("Add SVJ"), button:has-text("Nové SVJ"), a:has-text("Add SVJ"), a:has-text("Nové SVJ")').first()
    await expect(addSvjBtn).toBeVisible()
    await addSvjBtn.click()

    // SVJ form - name field variations
    const nameInput = page.locator('input[name="name"], input[name*="svj" i], input[placeholder*="SVJ" i]').first()
    await expect(nameInput).toBeVisible()
    await nameInput.fill(svjName)
    // Generic save button
    const saveSvj = page.locator('button:has-text("Save"), button:has-text("Uložit"), button:has-text("Create"), button:has-text("Vytvořit")').first()
    await saveSvj.click()

    // Assert new SVJ appears (return to list or remain and show header)
    await page.waitForTimeout(800) // minor debounce / network delay
    const svjEntry = page.locator(`text=${svjName}`).first()
    await expect(svjEntry).toBeVisible()

    // Navigate to SVJ detail (either row click or explicit "Detail")
    if (await svjEntry.locator('a:has-text("Detail"), button:has-text("Detail")').count()) {
      await svjEntry.locator('a:has-text("Detail"), button:has-text("Detail")').first().click()
    } else {
      await svjEntry.click()
    }
    await page.waitForURL(/svj\//)

    // 3. Create Employee inside this SVJ
    const addEmpBtn = page.locator('button:has-text("Add Employee"), button:has-text("Přidat zaměstnance"), a:has-text("Add Employee")').first()
    await expect(addEmpBtn).toBeVisible()
    await addEmpBtn.click()
    await page.waitForURL(/employees\/new|employee.*new/i)

    const firstName = page.locator('[name="firstName"], input[name*="first" i]').first()
    const lastName = page.locator('[name="lastName"], input[name*="last" i]').first()
    const email = page.locator('input[name="email"], input[type="email"]').first()
    await firstName.fill('Final')
    await lastName.fill('Testuser')
    const empEmail = `final.testuser.${Date.now()}@test.com`
    await email.fill(empEmail)
    const saveEmp = page.locator('button:has-text("Save Employee"), button:has-text("Uložit zaměstnance"), button:has-text("Save"), button:has-text("Uložit")').first()
    await saveEmp.click()

    // After save: either back to SVJ detail or employee list scoped to SVJ
    await page.waitForURL(/svj\/.+|employees($|\?)/)
    await expect(page.locator('text=Final Testuser').first()).toBeVisible()

    // Open employee detail (if not already on it)
  const empDetailVisible = await page.locator('h1:has-text("Final Testuser"), h2:has-text("Final Testuser")').count()
    if (!empDetailVisible) {
      const empRow = await findRow(page, 'Final Testuser')
      const view = empRow.locator('a:has-text("Detail"), button:has-text("Detail"), a:has-text("View"), button:has-text("View")').first()
      if (await view.count()) await view.click(); else await empRow.click()
      await page.waitForURL(/employees\//)
    }

    // 4. Create Payroll for the new Employee
    const createPayrollBtn = page.locator('button:has-text("Create Payroll"), button:has-text("New Payroll"), button:has-text("Zpracovat mzdu"), button:has-text("Nová mzda"), a:has-text("Create Payroll")').first()
    await expect(createPayrollBtn).toBeVisible()
    await createPayrollBtn.click()
    await page.waitForURL(/payrolls?\/new|payroll.*create/i)

    const gross = page.locator('input[name="gross_salary"], input[name="grossSalary"], input[name*="gross" i], input[name*="hrub" i]').first()
    await expect(gross).toBeVisible()
    await gross.fill('60000')
    const savePayroll = page.locator('button:has-text("Save Payroll"), button:has-text("Uložit"), button:has-text("Save")').first()
    await savePayroll.click()

    // Wait for payroll overview / list
    await page.waitForURL(/payrolls?($|\?|#)/)
    const payrollRow = page.locator('tr:has-text("Final Testuser"):has-text("60000"), div:has-text("Final Testuser"):has-text("60000")').first()
    await expect(payrollRow).toBeVisible()

    // 5. Download PDF payslip
    const downloadBtn = payrollRow.locator('a:has-text("Download PDF"), button:has-text("Download PDF"), a:has-text("PDF"), button:has-text("PDF")').first()
    await expect(downloadBtn).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await downloadBtn.click()
    const download = await downloadPromise
    const path = await download.path().catch(() => null)

    // Basic assertions about the downloaded file
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
    expect(path).not.toBeNull()
  })
})
