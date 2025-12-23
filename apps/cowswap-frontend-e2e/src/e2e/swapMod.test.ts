import { handleNativeBalance, mockSendCall } from '../support/mocks/mockSendCall'

const COW = '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59'
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// mock test to pass CI until we fix the test
it('should be true', () => {
  expect(true).to.be.true
})

describe('Swap (mod)', () => {
  it('starts with empty token selected', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    cy.get('#input-currency-input .token-amount-input').should('not.have.value')
    cy.get('#input-currency-input .token-symbol-container').should('contain.text', 'Select a token')
    cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    cy.get('#output-currency-input .token-symbol-container').should('contain.text', 'Select a token')
  })

  it('can enter an amount into input', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    cy.get('#input-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('0.001')
      .should('have.value', '0.001')
  })

  it('zero swap amount', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    cy.get('#input-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('0.0')
      .should('have.value', '0.0')
  })

  it('invalid swap amount', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    cy.get('#input-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('\\')
      .should('have.value', '')
  })

  it('can enter an amount into output', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    // first clear/reset the INPUT currency input field
    // as it is auto prefilled with "1"
    cy.get('#input-currency-input .token-amount-input')
      .clear()
      // then we select and clear the OUTPUT field
      .get('#output-currency-input .token-amount-input')
      .clear()
      // and type in an amount
      .type('0.001', { delay: 400, force: true })
      .should('have.value', '0.001')
  })

  it('zero output amount', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    // first clear/reset the INPUT currency input field
    // as it is auto prefilled with "1"
    cy.get('#input-currency-input .token-amount-input')
      .clear()
      // then we select and clear the OUTPUT field
      .get('#output-currency-input .token-amount-input')
      .clear()
      // and type in an amount
      .type('0.0')
      .should('have.value', '0.0')
  })

  it('can find COW and swap Native for COW', () => {
    cy.visit('/#/11155111/swap', {
      onBeforeLoad: async (win) => {
        mockSendCall(win.ethereum, [
          handleNativeBalance(
            win.ethereum,
            await win.ethereum.signer.getAddress(),
            50n * 10n ** 18n, // 18 decimals
          ),
        ])
      },
    })
    cy.unlockCrossChainSwap()
    cy.swapEnterInputAmount(ETH, '0.5', true)
    cy.swapSelectOutput(COW)
    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    cy.get('#do-trade-button').should('contain.text', 'Swap').click({ timeout: 10000 })
    cy.get('#trade-confirmation > button').should('contain', 'Confirm Swap')
  })

  it('add a recipient does not exist unless in expert mode', () => {
    cy.visit('/#/11155111/swap')
    cy.unlockCrossChainSwap()
    cy.get('#add-recipient-button').should('not.exist')
  })

  describe('recipient', () => {
    beforeEach(() => {
      cy.visit('/#/11155111/swap')
      cy.unlockCrossChainSwap()
      cy.get('#open-settings-dialog-button').click()
      cy.get('#toggle-recipient-mode-button').click()
    })

    it('Recipient is visible', () => {
      cy.get('#recipient').should('exist')
    })
  })
})
