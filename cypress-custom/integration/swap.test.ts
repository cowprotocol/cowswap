// MOD of original Uni Swap test
// Main differences summarised:
// GP doesn't use ETH, so we need to test for this

const CHAIN_ID = 5
const USDC = '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'
const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

function acceptFeesExceedWarning() {
  cy.get('#swap-button > button').should('contain.text', 'Swap')
  cy.get('body').then(($body) => {
    const feesExceedCheckbox = $body.find('#fees-exceed-checkbox')
    if (feesExceedCheckbox.length > 0) {
      feesExceedCheckbox.get(0).click()
    }
  })
}

describe('Swap (custom)', () => {
  // uses WETH instead of ETH
  it('can swap WETH for USDC', () => {
    cy.visit(`/${CHAIN_ID}/swap/${WETH}/${USDC}`)

    // input amounts
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.5', { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').should('contain.text', 'Swap').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  it('can swap ETH for USDC', () => {
    cy.visit(`/${CHAIN_ID}/swap/ETH/${USDC}`)
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.1', { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    acceptFeesExceedWarning()
    cy.get('#swap-button > button').should('contain.text', 'Swap').should('be.enabled').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  // ETH should be tradable but show Switch to Weth
  it('Swap ETH for USDC - shows optional Switch to WETH', () => {
    cy.visit(`/${CHAIN_ID}/swap/ETH/${USDC}`)

    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.5', { force: true, delay: 400 })

    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    acceptFeesExceedWarning()
    cy.get('#classic-eth-flow-banner').should('contain', 'Switch to the classic WETH').click()
    cy.get('#switch-to-wrapped').should('contain', 'Switch to WETH').click()
    cy.get('#swap-currency-input .token-symbol-container').should('contain', 'WETH')
  })
})
