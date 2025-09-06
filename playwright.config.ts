import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Only run *.spec.ts and *.spec.tsx Playwright tests; ignore integration (Jest style) tests
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  testIgnore: ['**/integration/**'],
  timeout: 30000,
  retries: 2,
  reporter: 'list',
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
