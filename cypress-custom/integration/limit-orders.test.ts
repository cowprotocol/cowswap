const CHAIN_ID = 5

function pickToken(symbol: string, role: 'input' | 'output') {
  cy.get(`#limit-orders-currency-${role} .open-currency-select-button`).click()
  cy.get('#token-search-input').type(symbol)
  cy.get('#currency-list').get('div').contains(symbol).click({ force: true })
}

describe('Limit orders', () => {
  it('Confirmation modal must contains values that were entered while creating', () => {
    const inputAmount = '0.1'
    const outputAmount = '2000000000000'

    cy.visit(`/#/${CHAIN_ID}/limit-orders`)
    cy.get('#unlock-limit-orders-btn').click()

    pickToken('WETH', 'input')
    pickToken('DAI', 'output')

    cy.get('#limit-orders-currency-input .token-amount-input').type(inputAmount)
    cy.get('#rate-limit-amount-input').clear().type(outputAmount, { force: true })
    cy.get('#review-limit-order-btn').click()

    cy.get('#limit-orders-currency-output .token-amount-input').should('have.value', '200B')
    cy.get('#limit-orders-confirm #input-currency-preview .token-amount-input').should('have.value', inputAmount)
    cy.get('#limit-orders-confirm #output-currency-preview .token-amount-input').should('have.value', '200B')
  })
})
