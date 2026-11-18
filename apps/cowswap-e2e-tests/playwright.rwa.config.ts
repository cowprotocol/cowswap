import { defineConfig, devices } from '@playwright/test'

import path from 'node:path'

const RWA_ORIGIN = 'http://localhost:3002'

export default defineConfig({
  testDir: './src/rwa/tests',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  expect: { timeout: 30_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: RWA_ORIGIN,
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: 'chromium-phone-width',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm preview:rwa' : 'pnpm start:rwa',
    cwd: path.resolve(__dirname, '../../'),
    url: `${RWA_ORIGIN}/rwa`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
