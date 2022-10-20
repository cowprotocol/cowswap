// MOD of original Uni Swap test
// Main differences summarised:
// GP doesn't use ETH, so we need to test for this

const DAI = '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60'
const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

describe('Swap (custom)', () => {
  // uses WETH instead of ETH
  // it('can swap ETH for DAI', () => {
  it('can swap WETH for DAI', () => {
    // select DAI
    // TODO: Define our command, so it search by name and select the input
    // cy.get('#swap-currency-output .open-currency-select-button').click()

    // cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').should('be.visible')
    // cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').click({ force: true })

    cy.visit(`/swap?inputCurrency=${WETH}&outputCurrency=${DAI}`)

    // input amounts
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.5', { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').should('contain.text', 'Swap').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  // ETH should be tradable but show Switch to Weth
  it('Swap ETH for DAI - shows Switch to WETH ', () => {
    cy.visit(`/swap?inputCurrency=ETH&outputCurrency=${DAI}`)

    // select ETH
    // cy.get('#swap-currency-input .open-currency-select-button').click()
    // cy.get('.token-item-ETHER').should('be.visible')
    // cy.get('.token-item-ETHER').click({ force: true })
    // select DAI
    // cy.get('#swap-currency-output .open-currency-select-button').click()
    // cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').should('be.visible')
    // cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').click({ force: true })
    // input amounts
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.05', { force: true, delay: 400 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#fees-exceed-checkbox').then((el) => {
      if (el) el.click()
    })
    cy.get('#swap-button').should('contain', 'Swap with WETH')
  })
})
