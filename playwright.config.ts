import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    locale: 'ja-JP',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000/api/diagnostics',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
