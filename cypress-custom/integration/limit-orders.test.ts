const CHAIN_ID = 5

function pickToken(symbol: string, role: 'input' | 'output') {
  cy.get(`#${role}-currency-input .open-currency-select-button`).click()
  cy.get('#token-search-input').type(symbol)
  cy.get('#currency-list').get('div').contains(symbol).click({ force: true })
}

describe('Limit orders', () => {
  it('Confirmation modal must contains values that were entered while creating', () => {
    const inputAmount = 0.1
    const rate = 2000000000000
    const outputAmount = inputAmount * rate

    cy.visit(`/#/${CHAIN_ID}/limit-orders`)
    cy.get('#unlock-limit-orders-btn').click()

    pickToken('USDC', 'output')

    cy.get('#input-currency-input .token-amount-input').type(inputAmount.toString())
    cy.get('#rate-limit-amount-input').clear().type(rate.toString(), { force: true })
    cy.get('#review-limit-order-btn').click()

    cy.get('#output-currency-input .token-amount-input').should('have.value', outputAmount.toString())
    cy.get('#limit-orders-confirm #input-currency-preview .token-amount-input').should(
      'contain.text',
      inputAmount.toString()
    )
    cy.get('#limit-orders-confirm #output-currency-preview .token-amount-input').should('contain.text', '200B')
  })
})
