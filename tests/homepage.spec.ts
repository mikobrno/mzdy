import { test, expect } from '@playwright/test';

test('homepage should load', async ({ page }) => {
  await page.goto('http://localhost:3004');
  const title = await page.title();
  expect(title).not.toBe('');
});
