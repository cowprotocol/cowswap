// MOD of original Uni Swap test
// Main differences summarised:
// GP doesn't use ETH, so we need to test for this

const CHAIN_ID = 11155111
const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function acceptFeesExceedWarning() {
  cy.get('#swap-button > button').should('contain.text', 'Swap')
  cy.get('body').then(($body) => {
    const feesExceedCheckbox = $body.find('#fees-exceed-checkbox')
    if (feesExceedCheckbox.length > 0) {
      feesExceedCheckbox.get(0).click()
    }
  })
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Swap (custom)', () => {
  // uses WETH instead of ETH
  it('can swap WETH for USDC', () => {
    cy.visit(`/#/${CHAIN_ID}/swap/${WETH}/${USDC}`)

    // input amounts
    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 200 })
    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').should('contain.text', 'Swap').click()
    cy.get('#trade-confirmation > button').should('contain', 'Confirm Swap')
  })

  it('can swap ETH for USDC', () => {
    cy.visit(`/#/${CHAIN_ID}/swap/ETH/${USDC}`)
    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 200 })
    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    acceptFeesExceedWarning()
    cy.get('#swap-button > button').should('contain.text', 'Swap').should('be.enabled').click()
    cy.get('#trade-confirmation > button').should('contain', 'Confirm Swap')
  })

  // ETH should be tradable but show Switch to Weth
  it('Swap ETH for USDC - shows optional Switch to WETH', () => {
    cy.visit(`/#/${CHAIN_ID}/swap/ETH/${USDC}`)

    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 400 })

    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    acceptFeesExceedWarning()
    cy.get('#classic-eth-flow-banner').should('contain', 'Switch to the classic WETH').click()
    cy.get('#switch-to-wrapped').should('contain', 'Switch to WETH').click()
    cy.get('#input-currency-input .token-symbol-container').should('contain', 'WETH')
  })

  describe('url params', () => {
    const SELL_TOKEN = 'WETH'
    const BUY_TOKEN = 'COW'

    it('should accept sellAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=0.5`)
      cy.get('#input-currency-input .token-amount-input').should('have.value', '0.5')
    })

    it('should not accept sellAmount url param when there is no sell token', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/_/${BUY_TOKEN}?sellAmount=0.5`)
      cy.get('#input-currency-input .token-amount-input').should('not.have.value')
    })

    it('should accept buyAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/${BUY_TOKEN}?buyAmount=0.5&orderKind=buy`)
      cy.get('#output-currency-input .token-amount-input').should('have.value', '0.5')
    })

    it('should not accept buyAmount url param when there is no buy token', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/_?buyAmount=0.5`)
      cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    })

    it('sellAmount should take precedence over buyAmount', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=0.5&buyAmount=0.6`)
      cy.get('#input-currency-input .token-amount-input').should('have.value', '0.5')
      cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    })
  })
})
