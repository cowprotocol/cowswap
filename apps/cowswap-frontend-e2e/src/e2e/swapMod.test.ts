const GNO = '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532'
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

describe('Swap (mod)', () => {
  beforeEach(() => {
    cy.visit('/#/5/swap')
  })

  it('starts with wrapped native selected', () => {
    cy.get('#input-currency-input .token-amount-input').should('not.have.value')
    cy.get('#input-currency-input .token-symbol-container').should('contain.text', 'WETH')
    cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    cy.get('#output-currency-input .token-symbol-container').should('contain.text', 'Select a token')
  })

  it('can enter an amount into input', () => {
    cy.get('#input-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('0.001')
      .should('have.value', '0.001')
  })

  it('zero swap amount', () => {
    cy.get('#input-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('0.0')
      .should('have.value', '0.0')
  })

  it('invalid swap amount', () => {
    cy.get('#input-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('\\')
      .should('have.value', '')
  })

  it('can enter an amount into output', () => {
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

  it('can find GNO and swap Native for GNO', () => {
    cy.swapEnterInputAmount(ETH, '0.5', true)
    cy.swapSelectOutput(GNO)
    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    cy.get('#swap-button > button').should('contain.text', 'Swap').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  it('add a recipient does not exist unless in expert mode', () => {
    cy.get('#add-recipient-button').should('not.exist')
  })

  describe('expert mode', () => {
    beforeEach(() => {
      cy.get('#open-settings-dialog-button').click()
      cy.get('#toggle-expert-mode-button').click()
      cy.get('#confirm-modal-input').type('confirm')
      cy.get('#confirm-modal-button').click()
    })

    it('Expert mode is ON', () => {
      cy.get(`[aria-label="Expert Mode Turned On"]`).should('be.visible')
    })
  })

  describe('recipient', () => {
    beforeEach(() => {
      cy.get('#open-settings-dialog-button').click()
      cy.get('#toggle-recipient-mode-button').click()
    })

    it('Recipient is visible', () => {
      cy.get('#recipient').should('exist')
    })
  })
})
