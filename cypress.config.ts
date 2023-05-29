import { defineConfig } from 'cypress'
import * as dotenv from 'dotenv'

import fs from 'fs'

let env = {}

if (!process.env.GITHUB_ENV) {
  try {
    const localEnvFile = fs.readFileSync('./.env.local')
    env = dotenv.parse(localEnvFile)
  } catch (err) {
    throw new Error('Could not read .env.local file: are you sure you have your local env vars set?')
  }
}

export default defineConfig({
  projectId: 'yp82ef',
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 120000,
  screenshotsFolder: 'cypress-custom/screenshots',
  videosFolder: 'cypress-custom/videos',
  downloadsFolder: 'cypress-custom/downloads',
  video: false,
  fixturesFolder: false,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress-custom/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress-custom/support/index.js',
    env,
  },
})
