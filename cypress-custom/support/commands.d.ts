/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Select token input in the swap page
     *
     * @example cy.selectTokens()
     */
    swapSelectInput(tokenAddress: string): Chainable<Element>
  }
}
