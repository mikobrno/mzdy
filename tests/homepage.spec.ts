import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || '3001';
const BASE = `http://localhost:${PORT}`;

test('homepage should load', async ({ page }) => {
  await page.goto(BASE);
  const title = await page.title();
  expect(title).not.toBe('');
});
