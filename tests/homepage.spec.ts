import { test, expect } from '@playwright/test';

test('homepage should load', async ({ page }) => {
  // Použij relativní cestu aby fungovalo s baseURL v playwright.config.ts
  await page.goto('/');
  const title = await page.title();
  expect(title).not.toBe('');
});
