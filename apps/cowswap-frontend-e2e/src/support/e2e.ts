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
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

beforeEach(() => {
  cy.on('window:load', (win) => {
    win.localStorage.clear()
    win.ethereum = injected
  })

  // Infura security policies are based on Origin headers.
  // These are stripped by cypress because chromeWebSecurity === false; this adds them back in.
  cy.intercept(/infura.io/, (res) => {
    res.headers['origin'] = 'http://localhost:3000'
    res.continue()
  })
})
