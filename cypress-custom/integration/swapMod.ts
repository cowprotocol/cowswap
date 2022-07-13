describe('Swap (mod)', () => {
  beforeEach(() => {
    cy.visit('/swap')
  })

  it('starts with an Native/USDC swap and quotes it', () => {
    cy.get('#swap-currency-input .token-amount-input').should('have.value', '1')
    cy.get('#swap-currency-input .token-symbol-container').should('contain.text', 'WETH')
    cy.get('#swap-currency-output .token-amount-input').should('not.have.value', '')
    cy.get('#swap-currency-output .token-symbol-container').should('contain.text', 'USDC')
  })

  it('can enter an amount into input', () => {
    cy.get('#swap-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('0.001')
      .should('have.value', '0.001')
  })

  it('zero swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('0.0')
      .should('have.value', '0.0')
  })

  it('invalid swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .type('\\')
      .should('have.value', '')
  })

  it('can enter an amount into output', () => {
    // first clear/reset the INPUT currency input field
    // as it is auto prefilled with "1"
    cy.get('#swap-currency-input .token-amount-input')
      .clear()
      // then we select and clear the OUTPUT field
      .get('#swap-currency-output .token-amount-input')
      .clear()
      // and type in an amount
      .type('0.001', { delay: 400, force: true })
      .should('have.value', '0.001')
  })

  it('zero output amount', () => {
    // first clear/reset the INPUT currency input field
    // as it is auto prefilled with "1"
    cy.get('#swap-currency-input .token-amount-input')
      .clear()
      // then we select and clear the OUTPUT field
      .get('#swap-currency-output .token-amount-input')
      .clear()
      // and type in an amount
      .type('0.0')
      .should('have.value', '0.0')
  })

  it('can find GNO and swap Native for GNO', () => {
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get('#token-search-input').type('GNO')
    cy.get('.token-item-0xd0Dab4E640D95E9E8A47545598c33e31bDb53C7c').should('be.visible')
    cy.get('.token-item-0xd0Dab4E640D95E9E8A47545598c33e31bDb53C7c').click({ force: true })
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('{selectall}{backspace}{selectall}{backspace}').type('0.5')
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  it('add a recipient does not exist unless in expert mode', () => {
    cy.get('#add-recipient-button').should('not.exist')
  })

  describe('expert mode', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('confirm')
      })
      cy.get('#open-settings-dialog-button').click()
      cy.get('#toggle-expert-mode-button').click()
      cy.get('#confirm-expert-mode').click()
    })

    it('add a recipient is visible', () => {
      cy.get('#add-recipient-button').should('be.visible')
    })

    it('add a recipient', () => {
      cy.get('#add-recipient-button').click()
      cy.get('#recipient').should('exist')
    })

    it('remove recipient', () => {
      cy.get('#add-recipient-button').click()
      cy.get('#remove-recipient-button').click()
      cy.get('#recipient').should('not.exist')
    })
  })
})
