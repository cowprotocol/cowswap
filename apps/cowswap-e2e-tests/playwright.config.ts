import { defineConfig, devices } from '@playwright/test'

import path from 'node:path'

export default defineConfig({
  testDir: './src/tests',
  // The Synpress MetaMask connect flow (extension boot + network switch + dapp approval)
  // takes ~20-25s on its own, so the 30s Playwright default leaves no room for the test body.
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 6,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  globalSetup: path.resolve(__dirname, 'src/support/globalSetup.ts'),
  globalTeardown: path.resolve(__dirname, 'src/support/globalTeardown.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-metamask',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm preview' : 'pnpm start:cowswap',
    cwd: path.resolve(__dirname, '../../'),
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
