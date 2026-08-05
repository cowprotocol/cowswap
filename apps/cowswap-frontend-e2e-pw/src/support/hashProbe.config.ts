import { defineConfig } from '@playwright/test'

// Minimal config for walletSetupHashProbe.spec.ts — no webServer, no globalSetup, no browser.
export default defineConfig({
  testDir: '.',
  testMatch: /walletSetupHashProbe\.spec\.ts/,
  reporter: [['list']],
  workers: 1,
})
