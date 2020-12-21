// TODO: this token can be added at any time, failing tests...
const UNLISTED_TOKEN = '0x6c6ee5e31d828de241282b9606c8e98ea48526e2'

describe('Warning', () => {
  beforeEach(() => {
    cy.visit('/swap?outputCurrency=' + UNLISTED_TOKEN)
  })

  it('Check that warning is displayed', () => {
    cy.get('.token-warning-container').should('be.visible')
  })

  it('Check that warning hides after button dismissal', () => {
    cy.get('.token-dismiss-button').should('be.disabled')
    cy.get('.understand-checkbox').click()
    cy.get('.token-dismiss-button').should('not.be.disabled')
    cy.get('.token-dismiss-button').click()
    cy.get('.token-warning-container').should('not.be.visible')
  })
})
