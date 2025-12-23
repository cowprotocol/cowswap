// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { injected } from './ethereum'

declare global {
  namespace Cypress {
    interface ApplicationWindow {
      ethereum: typeof injected
    }
    interface VisitOptions {
      serviceWorker?: true
    }
  }
}

Cypress.Commands.overwrite(
  'visit',
  (original, url: string | Partial<Cypress.VisitOptions>, options?: Partial<Cypress.VisitOptions>) => {
    assert(typeof url === 'string')

    original({
      ...options,
      url: url.toString(),
      onBeforeLoad(win) {
        options?.onBeforeLoad?.(win)
        win.localStorage.clear()
        win.ethereum = injected
      },
    })
  },
)

// serviceWorker breaks safary-sdk and window.load event, so we disable it
Cypress.on('window:before:load', (win) => {
  if (win.navigator?.serviceWorker) {
    // @ts-expect-error
    delete win.navigator.__proto__.serviceWorker
  }
})

const skippedUrls = [
  // analytics
  /ads-twitter.com/,
  /doubleclick.net/,
  /google-analytics.com/,
  /clarity.ms/,

  // other
  // /hypelab.com/,
  // /apiarydata.net/,
  // /launchdarkly.com/,
]

beforeEach(() => {
  // Infura security policies are based on Origin headers.
  // These are stripped by cypress because chromeWebSecurity === false; this adds them back in.
  cy.intercept(/infura.io/, (res) => {
    res.headers['origin'] = Cypress.config('baseUrl')!
    res.continue()
  })

  skippedUrls.forEach((url) => {
    cy.intercept(url, (res) => {
      res.reply({ statusCode: 404 })
    })
  })

  cy.on('window:before:load', (win) => {
    win.localStorage.clear()
    win.ethereum = injected
  })
})
