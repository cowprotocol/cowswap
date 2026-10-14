import { defineConfig, devices } from '@playwright/test'

import path from 'node:path'

const timeoutMultiplier = parseInt(process.env.TIMEOUT_MULTIPLIER ?? '1')

export default defineConfig({
  testDir: './src/tests',
  timeout: 120_000 * timeoutMultiplier,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  expect: { timeout: 30_000 * timeoutMultiplier },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 6,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  globalSetup: path.resolve(__dirname, 'src/support/globalSetup.ts'),
  globalTeardown: path.resolve(__dirname, 'src/support/globalTeardown.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    // `retain-on-failure` still records trace/video continuously through every passing test and
    // only discards it afterwards — real CPU/memory overhead on the shared CI runner that we don't
    // need for tests that pass first try. `on-first-retry` only starts recording once a test has
    // already failed once, freeing up headroom for the timing-sensitive waits below.
    trace: 'on-first-retry',
    video: 'on-first-retry',
    actionTimeout: 120_000 * timeoutMultiplier,
    navigationTimeout: 30_000 * timeoutMultiplier,
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
