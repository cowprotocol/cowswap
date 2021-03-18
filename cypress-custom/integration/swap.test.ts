import './swapMod'

// MOD of original Uni Swap test
// Main differences summarised:
// GP doesn't use ETH, so we need to test for this

describe('Swap (custom)', () => {
  beforeEach(() => {
    cy.visit('/swap')
  })

  // uses WETH instead of ETH
  // it('can swap ETH for DAI', () => {
  it('can swap WETH for DAI', () => {
    // select DAI
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').should('be.visible')
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').click({ force: true })
    // input amounts
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  // ETH should NOT be tradable
  it('cannot swap ETH for DAI', () => {
    // select ETH
    cy.get('#swap-currency-input .open-currency-select-button').click()
    cy.get('.token-item-ETHER').should('be.visible')
    cy.get('.token-item-ETHER').click({ force: true })
    // select DAI
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').should('be.visible')
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').click({ force: true })
    // input amounts
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button')
      .should('be.disabled')
      .should('contain', 'ETH cannot be traded. Use WETH')
  })
})
