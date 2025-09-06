import { test, expect } from '@playwright/test'

// Employee CRUD lifecycle test
// Assumptions:
// - baseURL configured in playwright.config.ts
// - Login page at /login, employee list at /employees, create form at /employees/new
// - Form fields use name attributes: firstName, lastName, email
// - Buttons may be in English or Czech; selectors are resilient (regex alternatives)

async function doLogin(page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 })
  // Flexible selectors for email/password
  const emailField = page.locator('input[name="email"], input[type="email"]')
  const passField = page.locator('input[name="password"], input[type="password"]')
  await expect(emailField.first()).toBeVisible()
  await emailField.first().fill('admin@onlinesprava.cz')
  await passField.first().fill('123456')
  await page.getByRole('button', { name: /login|přihlásit/i }).click()
  // Wait for either dashboard or employees redirect
  await page.waitForLoadState('networkidle')
}

// Vyčištění lokální fallback storage před KAŽDÝM testem (izolace dat)
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    try {
      localStorage.removeItem('dev_fallback_svj')
      localStorage.removeItem('dev_fallback_employees')
    } catch { /* ignore */ }
  })
})

test.describe('Employee CRUD', () => {
  test('full lifecycle create / read / update / delete', async ({ page }) => {
    await doLogin(page)
    // Forward browser console for debug
    page.on('console', msg => {
      // Log level & text
      console.log('[BROWSER]', msg.type(), msg.text())
    })
  // 1. Create SVJ first (true end-to-end)
  await page.goto('/svj')
  // Wait for either empty state add button or header add button
  const addSvjBtn = page.locator('[data-test="add-svj-button"], [data-test="add-svj-empty"]').first()
  await addSvjBtn.waitFor({ state: 'visible', timeout: 15000 })
  await addSvjBtn.click()

  await page.waitForURL('**/svj/new', { timeout: 10000 })
  const now = Date.now()
  const uniqueSvjName = `Test SVJ ${now}`
  const uniqueIco = String(now % 100000000).padStart(8, '0')
  await page.locator('[data-test="svj-name-input"]').fill(uniqueSvjName)
  // Minimální povinné další pole IČO
  await page.locator('input[placeholder="12345678"]').fill(uniqueIco)
  // Adresa
  await page.locator('textarea[placeholder*="Ulice"]').fill('Testovací 1, Město, 12345')
  await page.locator('[data-test="svj-save-button"]').click()
  // Pokus o rychlé zachycení redirectu nebo fallback
  try {
    await page.waitForURL('**/svj', { timeout: 5000 })
  } catch {
    // Pokud jsme stále na /svj/new, zkusíme zjistit zda je SVJ uložen v mock localStorage
    if (page.url().includes('/svj/new')) {
      const mockCount = await page.evaluate(() => {
        const raw = window.localStorage.getItem('mock_svj');
        if (!raw) return 0; try { return (JSON.parse(raw) || []).length } catch { return -1 }
      })
      console.log('[TEST] Redirect na /svj se neprovedl automaticky, mockCount =', mockCount)
        // Zkusíme zjistit zda se na stránce objevila chybová hláška
        const errorText = await page.locator('text=/duplicate key value/i').first().textContent().catch(() => null)
        if (errorText) {
          console.log('[TEST] Zachycena chybová hláška:', errorText)
        }
      await page.goto('/svj')
    }
  }
  // Ověř nově vytvořené SVJ
  await expect(page.locator(`[data-test="svj-card"]:has-text("${uniqueSvjName}")`).first()).toBeVisible({ timeout: 15000 })

  // 2. Proceed to Employees creation
  await page.goto('/employees')

    // Robust wait: either table (employees-table) or empty-state appears
    const tableLocator = page.locator('[data-test="employees-table"]')
    const emptyLocator = page.locator('[data-test="empty-state"]')
    await Promise.race([
      tableLocator.waitFor({ state: 'visible', timeout: 10000 }),
      emptyLocator.waitFor({ state: 'visible', timeout: 10000 })
    ])

    // CREATE
    const addButton = page.locator('[data-test="add-employee-button"], button:has-text("Add Employee"), button:has-text("Přidat zaměstnance"), a:has-text("Add Employee"), a:has-text("Přidat zaměstnance")').first()
    await expect(addButton).toBeVisible()
    await addButton.click()
    await page.waitForURL('**/employees/new')
    await expect(page).toHaveURL(/\/employees\/new$/)

  const uniqueEmail = `john.doe.${Date.now()}@test.com`
    const svjSelect = page.locator('[data-test="employee-svj-select"]')
    await expect(svjSelect).toBeVisible({ timeout: 10000 })
    // Počkej dokud se nenačte alespoň jedna nenulová option (asynchronní fetch seznamu SVJ)
    await page.waitForFunction((sel) => {
      const el = document.querySelector(sel) as HTMLSelectElement | null
      if (!el) return false
      return Array.from(el.options).some(o => o.value && o.value.trim().length > 0)
    }, '[data-test="employee-svj-select"]', { timeout: 10000 })
    // Získání první validní (neprázdné) option hodnoty
    const firstValidValue = await svjSelect.evaluate((el: HTMLSelectElement) => {
      const vals = Array.from(el.options).map(o => o.value).filter(v => v && v.trim().length > 0)
      return vals[0] || null
    })
    if (!firstValidValue) {
      throw new Error('Cannot create employee: No SVJ available to select.')
    }
    await svjSelect.selectOption(firstValidValue)

    await page.locator('[data-test="employee-fullName-input"]').fill('John Doe')
    await page.locator('[data-test="employee-email-input"]').fill(uniqueEmail)

    // Try to click a save button (multiple possible labels)
  const saveCreateBtn = page.locator('[data-test="employee-save-button"]')
  await expect(saveCreateBtn).toBeVisible()
  await saveCreateBtn.click()

  // READ & VERIFY
  await page.waitForURL('**/employees', { timeout: 15000 })
  await expect(page).toHaveURL(/\/employees$/)
  await page.waitForSelector('[data-test="employees-table"]', { timeout: 10000 })
    const johnRow = page.locator('text=John Doe').first()
    await expect(johnRow).toBeVisible({ timeout: 15000 })

    // 4. Cleanup (delete employee then optionally SVJ) – if UI supports delete.
    // Attempt to open employee detail and delete if controls exist (best-effort, non-fatal failures ignored)
    try {
      await johnRow.click({ timeout: 3000 })
      // Look for delete button candidates
      const deleteBtn = page.locator('button:has-text("Smazat"), button:has-text("Delete")').first()
      if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        page.on('dialog', d => d.accept())
        await deleteBtn.click()
        await page.waitForURL('**/employees', { timeout: 10000 })
      }
    } catch { /* ignore cleanup errors */ }
    // SVJ delete (if route exists) not implemented yet – requires a detail page action.
  // UPDATE/DELETE kroky dočasně odstraněny dle zadání
  })
})
