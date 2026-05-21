// MOD of original Uni Swap test
// Main differences summarised:
// GP doesn't use ETH, so we need to test for this

import { TEST_ADDRESS_NEVER_USE } from '../support/ethereum'
import { setupRpcMocks } from '../support/mocks/mockRpcCall'

const CHAIN_ID = 11155111
const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

function acceptFeesExceedWarning(): Cypress.Chainable {
  return waitForSwapAction().then(() => {
    cy.get('body').then(($body) => {
      if ($body.find('#fees-exceed-checkbox').length > 0) {
        cy.get('#fees-exceed-checkbox').check({ force: true })
      }
    })
  })
}

function waitForSwapAction(): Cypress.Chainable {
  return cy
    .get('#currency-arrow-separator', { timeout: 30_000 })
    .should('not.have.attr', 'data-isLoading')
    .get('#do-trade-button', { timeout: 30_000 })
    .should('be.visible')
    .and('contain.text', 'Swap')
}

describe('Swap (custom)', () => {
  // uses WETH instead of ETH
  it('can swap WETH for USDC', () => {
    const mocks = setupRpcMocks()
    mocks.mockTokenBalance(WETH, 5n * 10n ** 18n)
    mocks.mockTokenAllowance(WETH, 5n * 10n ** 18n)

    cy.visit(`/#/${CHAIN_ID}/swap/${WETH}/${USDC}`)
    cy.unlockCrossChainSwap()

    // input amounts
    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#currency-arrow-separator').should('not.have.attr', 'data-isLoading')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 200 })
    cy.get('#output-currency-input .token-amount-input').should('not.have.value', '')
    acceptFeesExceedWarning()
    waitForSwapAction().should('be.enabled').click()
    cy.get('#trade-confirmation > button').should('contain', 'Confirm Swap')
  })

  it('can swap ETH for USDC', () => {
    const mocks = setupRpcMocks()
    mocks.mockNativeBalance(TEST_ADDRESS_NEVER_USE, 5n * 10n ** 18n)

    cy.visit(`/#/${CHAIN_ID}/swap/ETH/${USDC}`)
    cy.unlockCrossChainSwap()

    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#currency-arrow-separator').should('not.have.attr', 'data-isLoading')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 200 })
    cy.get('#output-currency-input .token-amount-input').should('not.have.value', '')
    acceptFeesExceedWarning()
    waitForSwapAction().should('be.enabled').click()
    cy.get('#trade-confirmation > button').should('contain', 'Confirm Swap')
  })

  // ETH should be tradable but show Switch to Weth
  it('Swap ETH for USDC - shows optional Switch to WETH', () => {
    const mocks = setupRpcMocks()
    mocks.mockNativeBalance(TEST_ADDRESS_NEVER_USE, 5n * 10n ** 18n)
    mocks.mockTokenBalance(WETH, 5n * 10n ** 18n)

    cy.visit(`/#/${CHAIN_ID}/swap/ETH/${USDC}`)
    cy.unlockCrossChainSwap()

    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#currency-arrow-separator').should('not.have.attr', 'data-isLoading')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 400 })

    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    acceptFeesExceedWarning()
    waitForSwapAction()
    cy.get('#classic-eth-flow-banner')
      .should('exist')
      .should('contain.text', 'Switch to the classic WETH experience and benefit!')
  })

  describe('url params', () => {
    it('should accept sellAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/WETH/${USDC}?sellAmount=10`)
      cy.unlockCrossChainSwap()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '10')
    })

    it('should not accept sellAmount url param when there is no sell token', () => {
      // Visit swap page with only a buy token (no sell token) — the sell input should be empty
      cy.visit(`/#/${CHAIN_ID}/swap?buyToken=${USDC}&sellAmount=10`)
      cy.unlockCrossChainSwap()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '')
    })

    it('should accept buyAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/WETH/${USDC}?buyAmount=10`)
      cy.unlockCrossChainSwap()
      cy.get('#output-currency-input .token-amount-input').should('have.value', '10')
    })

    it('should not accept buyAmount url param when there is no buy token', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/WETH/?buyAmount=10`)
      cy.unlockCrossChainSwap()
      cy.get('#output-currency-input .token-amount-input').should('have.value', '')
    })

    it('sellAmount should take precedence over buyAmount', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/WETH/${USDC}?sellAmount=10&buyAmount=20`)
      cy.unlockCrossChainSwap()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '10')
    })
  })
})
