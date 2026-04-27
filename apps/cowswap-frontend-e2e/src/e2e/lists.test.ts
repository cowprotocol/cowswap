import { LARGE_TIMEOUT } from '../config'

describe('Lists', () => {
  beforeEach(() => {
    cy.visit('/#/11155111/swap/')
  })

  it('change list', () => {
    cy.unlockCrossChainSwap()
    cy.get('#output-currency-input .open-currency-select-button', { timeout: LARGE_TIMEOUT })
      .should('be.enabled')
      .click()
    cy.get('#list-token-manage-button').click()
    cy.get('#tokens-lists-table > div').should('have.length.greaterThan', 0)
  })
})
