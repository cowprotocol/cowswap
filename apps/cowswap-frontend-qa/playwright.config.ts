import { defineConfig, devices } from '@playwright/test'

const ANVIL_RPC_URL = 'http://127.0.0.1:8545'

export default defineConfig({
  testDir: './src/tests',
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 20_000,
  },
  reporter: [[process.env.CI ? 'line' : 'list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: {
      width: 1440,
      height: 900,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
  ],
  webServer: {
    command: 'pnpm exec nx run cowswap-frontend:preview:production',
    env: {
      ...process.env,
      NX_DAEMON: 'false',
      REACT_APP_NETWORK_URL_1: process.env.REACT_APP_NETWORK_URL_1 || ANVIL_RPC_URL,
      REACT_APP_SERVICE_WORKER: 'false',
    },
    url: 'http://127.0.0.1:3000',
    timeout: 600_000,
    reuseExistingServer: false,
  },
})
