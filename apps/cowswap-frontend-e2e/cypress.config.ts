import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, {
      bundler: 'vite',
    }),
    specPattern: ['src/**/*.test.{js,jsx,ts,tsx}'],
    baseUrl: 'http://localhost:3000',
    supportFile: 'src/support/index.ts',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 15_000
  },
})
