import { test, expect } from '@playwright/test'

// Základní E2E test přihlášení
// Předpoklad: baseURL je nastaven v playwright.config.ts
// Cíle testu:
// 1. Otevřít /login
// 2. Zkontrolovat viditelnost pole pro e-mail
// 3. Zkontrolovat viditelnost pole pro heslo
// 4. Zkontrolovat viditelnost tlačítka "Login"

test.describe('Login page', () => {
  test('should render email, password inputs and login button', async ({ page }) => {
    // Console forwarder for debugging runtime errors
    page.on('console', msg => {
      // Log level + text to host terminal
      // Include first argument JSON if available
      try {
        const type = msg.type();
        const text = msg.text();
        // eslint-disable-next-line no-console
        console.log(`[browser:${type}] ${text}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('[browser:log] <unserializable console message>');
      }
    })
  await page.goto('/login')
  await page.waitForSelector('input[type="email"], input[name*="email" i]')

    // Email input - zkusíme selektory podle name, type nebo placeholder
    const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]')
    await expect(emailInput.first()).toBeVisible()

    // Password input
    const passwordInput = page.locator('input[type="password"], input[name*="pass" i], input[placeholder*="heslo" i]')
    await expect(passwordInput.first()).toBeVisible()

    // Login button - hledáme text (case-insensitive) "Login" nebo českou variantu
    const loginButton = page.getByRole('button', { name: /login|přihlásit/i })
    await expect(loginButton).toBeVisible()
  })

  test('successful login redirects to dashboard and shows Logout', async ({ page }) => {
  await page.goto('/login')
  await page.waitForSelector('#email', { timeout: 10000 })

    // Fill credentials
  await page.locator('#email').fill('admin@onlinesprava.cz')
  await page.locator('#password').fill('123456')
    await page.getByRole('button', { name: /login|přihlásit/i }).click()

  // Wait for navigation to root (dashboard is at /)
  await page.waitForURL('**/', { timeout: 10000 })
  await expect(page).toHaveURL(/\/$/)

    // Assert logout button (unique post-login element)
    const logoutButton = page.getByRole('button', { name: /logout|odhlásit/i })
    await expect(logoutButton).toBeVisible()
  })

  test('failed login with wrong password shows error and stays on login', async ({ page }) => {
  // Attach console logger for this test too
  page.on('console', msg => {
    try {
      // eslint-disable-next-line no-console
      console.log(`[browser:${msg.type()}] ${msg.text()}`)
    } catch (e) {
      // ignore serialization errors
    }
  })
  await page.goto('/login')
  await page.waitForSelector('#email', { timeout: 10000 })

  await page.locator('#email').fill('admin@onlinesprava.cz')
  await page.locator('#password').fill('wrongpassword')
    await page.getByRole('button', { name: /login|přihlásit/i }).click()

    // Stay on login page
    await expect(page).toHaveURL(/\/login$/)

    // Error message assertion - flexible selectors
  // Error message via data-test attribute
  await page.waitForSelector('[data-test="login-error"]', { timeout: 5000 })
  })
})
