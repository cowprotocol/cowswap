// MOD of original Uni Swap test
// Main differences summarised:
// GP doesn't use ETH, so we need to test for this

import {
  handleNativeBalance,
  handleTokenAllowance,
  handleTokenBalance,
  mockSendCall,
} from '../support/mocks/mockSendCall'

const CHAIN_ID = 11155111
const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

function waitForSwapAction(): Cypress.Chainable {
  return cy
    .get('#currency-arrow-separator', { timeout: 30_000 })
    .should('not.have.attr', 'data-isLoading')
    .get('#do-trade-button', { timeout: 30_000 })
    .should('be.visible')
    .and('contain.text', 'Swap')
}

function acceptFeesExceedWarning(): Cypress.Chainable {
  return waitForSwapAction().then(() => {
    cy.get('body').then(($body) => {
      if ($body.find('#fees-exceed-checkbox').length > 0) {
        cy.get('#fees-exceed-checkbox').check({ force: true })
      }
    })
  })
}

describe('Swap (custom)', () => {
  // uses WETH instead of ETH
  it('can swap WETH for USDC', () => {
    cy.visit(`/#/${CHAIN_ID}/swap/${WETH}/${USDC}`, {
      onBeforeLoad: async (win) => {
        mockSendCall(win.ethereum, [
          handleTokenBalance(
            win.ethereum,
            WETH,
            5n * 10n ** 18n, // 18 decimals
          ),
          handleTokenAllowance(
            win.ethereum,
            WETH,
            5n * 10n ** 18n, // 18 decimals
          ),
        ])
      },
    })
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
    cy.visit(`/#/${CHAIN_ID}/swap/ETH/${USDC}`, {
      onBeforeLoad: (win) => {
        mockSendCall(win.ethereum, [
          handleNativeBalance(
            win.ethereum,
            win.ethereum.address,
            5n * 10n ** 18n, // 18 decimals
          ),
        ])
      },
    })
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
    cy.visit(`/#/${CHAIN_ID}/swap/ETH/${USDC}`, {
      onBeforeLoad: (win) => {
        mockSendCall(win.ethereum, [
          handleNativeBalance(
            win.ethereum,
            win.ethereum.address,
            5n * 10n ** 18n, // 18 decimals
          ),
        ])
      },
    })
    cy.unlockCrossChainSwap()

    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#currency-arrow-separator').should('not.have.attr', 'data-isLoading')
    cy.get('#input-currency-input .token-amount-input').type('0.5', { force: true, delay: 400 })

    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    acceptFeesExceedWarning()
    waitForSwapAction()
    cy.get('#classic-eth-flow-banner')
      .should('contain', 'Switch to the classic')
      .and('contain', 'experience and benefit!')
      .click()
    cy.get('#switch-to-wrapped').should('contain', 'Switch to WETH').click()
  })

  describe('url params', () => {
    const SELL_TOKEN = 'WETH'
    const BUY_TOKEN = 'COW'

    it('should accept sellAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=0.5`)
      cy.unlockCrossChainSwap()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '0.5')
    })

    it('should not accept sellAmount url param when there is no sell token', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/_/${BUY_TOKEN}?sellAmount=0.5`)
      cy.unlockCrossChainSwap()
      cy.get('#input-currency-input .token-amount-input').should('not.have.value')
    })

    it('should accept buyAmount url param', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/${BUY_TOKEN}?buyAmount=0.5&orderKind=buy`)
      cy.unlockCrossChainSwap()
      cy.get('#output-currency-input .token-amount-input').should('have.value', '0.5')
    })

    it('should not accept buyAmount url param when there is no buy token', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/_?buyAmount=0.5`)
      cy.unlockCrossChainSwap()
      cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    })

    it('sellAmount should take precedence over buyAmount', () => {
      cy.visit(`/#/${CHAIN_ID}/swap/${SELL_TOKEN}/${BUY_TOKEN}?sellAmount=0.5&buyAmount=0.6`)
      cy.unlockCrossChainSwap()
      cy.get('#input-currency-input .token-amount-input').should('have.value', '0.5')
      cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    })
  })
})
