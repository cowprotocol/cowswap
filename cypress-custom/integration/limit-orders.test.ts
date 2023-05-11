const CHAIN_ID = 5

describe('Limit orders', () => {
  it('Confirmation modal must contains values that were entered while creating', () => {
    const inputAmount = 0.1
    const rate = 2000000000000
    const outputAmount = inputAmount * rate

    cy.visit(`/#/${CHAIN_ID}/limit-orders`)
    cy.get('#unlock-limit-orders-btn').click()

    cy.limitPickToken('USDC', 'output')

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

  describe('url params', () => {
    const SELL_TOKEN = 'WETH'
    const BUY_TOKEN = 'DAI'

    it('should accept sellAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/limit-orders/${SELL_TOKEN}?sellAmount=0.1`)
      cy.get('#unlock-limit-orders-btn').click()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '0.1')
    })

    it('should not accept sellAmount when there is no sell token', () => {
      cy.visit(`/#/${CHAIN_ID}/limit-orders/_/${BUY_TOKEN}?sellAmount=0.1`)
      cy.get('#unlock-limit-orders-btn').click()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '')
    })

    it('should accept buyAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/limit-orders/_/${BUY_TOKEN}?buyAmount=0.1`)
      cy.get('#unlock-limit-orders-btn').click()
      cy.get('#output-currency-input .token-amount-input').should('have.value', '0.1')
    })

    it('should not accept buyAmount when there is no buy token', () => {
      cy.visit(`/#/${CHAIN_ID}/limit-orders?buyAmount=0.1`)
      cy.get('#unlock-limit-orders-btn').click()
      cy.get('#output-currency-input .token-amount-input').should('have.value', '')
    })

    it('should accept both sellAmount and buyAmount url params', () => {
      cy.visit(`/#/${CHAIN_ID}/limit-orders/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=0.1&buyAmount=0.2`)
      cy.get('#unlock-limit-orders-btn').click()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '0.1')
      cy.get('#output-currency-input .token-amount-input').should('have.value', '0.2')
    })

    it('should ignore invalid sellAmount and buyAmount url params', () => {
      cy.visit(`/#/${CHAIN_ID}/limit-orders/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=rwe&buyAmount=aaa`)
      cy.get('#unlock-limit-orders-btn').click()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '')
      cy.get('#output-currency-input .token-amount-input').should('have.value', '')
    })
  })
})
