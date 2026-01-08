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
import { CyHttpMessages } from 'cypress/types/net-stubbing'

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
  /googletagmanager.com/,

  // other
  /telegram.org/,
  // /hypelab.com/,
  // /apiarydata.net/,
  // /launchdarkly.com/,
]

const cypressCache = new Map<string, CyHttpMessages.IncomingHttpResponse<unknown>>()

const cachedUrls = [
  /raw.githubusercontent.com\/cowprotocol\/cowswap/,
  /files.cow.fi\/token-lists\/.*.json/,
  /files.cow.fi\/tokens\/.*.json/,
  /cms.cow.fi\/api\/solvers/,
  /cms.cow.fi\/api\/announcements/,
  /cms.cow.fi\/api\/correlated-tokens/,
  /cms.cow.fi\/api\/notification-list/,
]

beforeEach(() => {
  // Infura security policies are based on Origin headers.
  // These are stripped by cypress because chromeWebSecurity === false; this adds them back in.
  cy.intercept(/infura.io/, (req) => {
    req.headers['origin'] = Cypress.config('baseUrl')!
    req.continue()
  })

  skippedUrls.forEach((url) => {
    cy.intercept(url, (req) => {
      req.reply({ statusCode: 404 })
    })
  })

  // hard cache static files within test file
  cachedUrls.forEach((url) => {
    cy.intercept(url, (req) => {
      const cached = cypressCache.get(req.url)
      if (cached) {
        req.reply(cached)
      } else {
        req.continue((res) => {
          cypressCache.set(req.url, {
            ...res,
            headers: {}, // original headers break req.reply
          })
        })
      }
    })
  })

  cy.on('window:before:load', (win) => {
    win.localStorage.clear()
    win.ethereum = injected
  })
})
