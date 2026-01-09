import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'
import macrosPlugin from 'vite-plugin-babel-macros'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, {
      bundler: 'vite',
      viteConfigOverrides: {
        plugins: [
          nodePolyfills({
            globals: {
              Buffer: true,
              global: true,
              process: true,
            },
            protocolImports: true,
          }),
          viteTsConfigPaths({
            root: '../../',
          }),
          macrosPlugin(),
        ],
      },
    }),
    specPattern: ['src/**/*.test.{js,jsx,ts,tsx}'],
    baseUrl: 'http://localhost:3000',
    supportFile: 'src/support/index.ts',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 25_000,
    pageLoadTimeout: 25_000,
  },
})
