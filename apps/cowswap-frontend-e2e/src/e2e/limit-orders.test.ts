const CHAIN_ID = 11155111
const SELL_TOKEN = 'WETH'
const BUY_TOKEN = 'COW'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function unlock() {
  cy.get('#unlock-limit-orders-btn', { timeout: 10000 }).click()
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function navigate(path = '', unlockLimitOrders = true) {
  cy.visit(`/#/${CHAIN_ID}/limit${path}`)

  if (unlockLimitOrders) {
    unlock()
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getInputToken() {
  return cy.get('#input-currency-input .token-amount-input').should('be.enabled')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getOutputToken() {
  return cy.get('#output-currency-input .token-amount-input').should('be.enabled')
}

describe('Limit orders', () => {
  it('Confirmation modal must contains values that were entered while creating', () => {
    const inputAmount = 0.1
    const rate = 2000000000000
    const outputAmount = inputAmount * rate

    navigate('')

    getInputToken().type(inputAmount.toString())
    cy.get('#rate-limit-amount-input').should('be.enabled').clear().type(rate.toString(), { force: true })
    getOutputToken().should('have.value', outputAmount.toString())

    cy.get('#do-trade-button').click()

    cy.get('#input-currency-preview .token-amount-input').should('contain.text', inputAmount.toString())
    cy.get('#output-currency-preview .token-amount-input').should('contain.text', '200B')
  })

  describe('url params', () => {
    it('should accept sellAmount url param', () => {
      navigate(`/${SELL_TOKEN}?sellAmount=0.1`)
      getInputToken().should('have.value', '0.1')
    })

    it('should not accept sellAmount when there is no sell token', () => {
      navigate(`/_/${BUY_TOKEN}?sellAmount=0.1`)
      getInputToken().should('have.value', '')
    })

    it('should accept buyAmount url param', () => {
      navigate(`/_/${BUY_TOKEN}?buyAmount=0.1`)
      getOutputToken().should('have.value', '0.1')
    })

    it('should not accept buyAmount when there is no buy token', () => {
      navigate(`/${SELL_TOKEN}?buyAmount=0.1`)
      getOutputToken().should('have.value', '')
    })

    it('should accept both sellAmount and buyAmount url params', () => {
      navigate(`/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=0.1&buyAmount=0.2`)
      getInputToken().should('have.value', '0.1')
      getOutputToken().should('have.value', '0.2')
    })

    it('sell amount should be 1 by default', () => {
      navigate(`/${SELL_TOKEN}/${BUY_TOKEN}`)
      getInputToken().should('have.value', '1')
      getOutputToken().should('have.value', '')
    })
  })
})

export {}
