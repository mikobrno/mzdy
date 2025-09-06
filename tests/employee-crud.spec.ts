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
  await emailField.first().fill('test@example.com')
  await passField.first().fill('password123')
  await page.getByRole('button', { name: /login|přihlásit/i }).click()
  // Wait for either dashboard or employees redirect
  await page.waitForLoadState('networkidle')
}

test.describe('Employee CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page)
    // Navigate to employees list (in case login lands elsewhere)
    await page.goto('/employees')
  })

  test('full lifecycle create / read / update / delete', async ({ page }) => {
    // CREATE
    const addButton = page.getByRole('button', { name: /add employee|přidat zaměstnance/i }).or(page.getByRole('link', { name: /add employee|přidat zaměstnance/i }))
    await addButton.first().click()
    await page.waitForURL('**/employees/new')
    await expect(page).toHaveURL(/\/employees\/new$/)

    const uniqueEmail = `john.doe.${Date.now()}@test.com`
    await page.locator('[name="firstName"]').fill('John')
    await page.locator('[name="lastName"]').fill('Doe')
    await page.locator('[name="email"]').fill(uniqueEmail)

    // Try to click a save button (multiple possible labels)
    const saveCreateBtn = page.getByRole('button', { name: /save employee|uložit zaměstnance|save|uložit/i })
    await saveCreateBtn.first().click()

    // READ & VERIFY
    await page.waitForURL('**/employees')
    await expect(page).toHaveURL(/\/employees$/)
    const johnRow = page.locator('tr:has-text("John Doe"), li:has-text("John Doe"), div:has-text("John Doe")').first()
    await expect(johnRow).toBeVisible()

    // UPDATE
    // Find the edit button within the row
    const editButton = johnRow.locator('button:has-text("Edit"), a:has-text("Edit"), button:has-text("Upravit"), a:has-text("Upravit")').first()
    await editButton.click()

    // On edit form
    const firstNameInput = page.locator('[name="firstName"]')
    await expect(firstNameInput).toBeVisible()
    await firstNameInput.fill('Jane')

    const saveChangesBtn = page.getByRole('button', { name: /save changes|uložit změny|save|uložit/i })
    await saveChangesBtn.first().click()

    await page.waitForURL('**/employees')
    await expect(page).toHaveURL(/\/employees$/)

    // Old name gone, new name present
    await expect(page.getByText('John Doe').first()).toHaveCount(0)
    const janeRow = page.locator('tr:has-text("Jane Doe"), li:has-text("Jane Doe"), div:has-text("Jane Doe")').first()
    await expect(janeRow).toBeVisible()

    // DELETE
    page.on('dialog', d => d.accept())
    const deleteButton = janeRow.locator('button:has-text("Delete"), button:has-text("Smazat"), a:has-text("Delete"), a:has-text("Smazat")').first()
    await deleteButton.click()

    // Verify removal (allow short wait because deletion may re-render)
    await expect(page.locator('text=Jane Doe').first()).toHaveCount(0)
  })
})
