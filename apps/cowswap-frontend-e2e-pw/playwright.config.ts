import { defineConfig, devices } from '@playwright/test'

import path from 'node:path'

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  globalSetup: path.resolve(__dirname, 'src/support/globalSetup.ts'),
  globalTeardown: path.resolve(__dirname, 'src/support/globalTeardown.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-metamask',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm nx serve cowswap-frontend',
    cwd: path.resolve(__dirname, '../../'),
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
