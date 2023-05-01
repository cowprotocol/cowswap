describe('Swap', () => {
  beforeEach(() => {
    cy.visit('/swap').get('#input-currency-input .token-amount-input')
  })

  it.skip('starts with an ETH/USDC swap and quotes it', () => {
    cy.get('#input-currency-input .token-amount-input').should('have.value', '1')
    cy.get('#input-currency-input .token-symbol-container').should('contain.text', 'ETH')
    cy.get('#output-currency-input .token-amount-input').should('not.have.value')
    cy.get('#output-currency-input .token-symbol-container').should('contain.text', 'Select a token')
  })

  it.skip('can enter an amount into input', () => {
    cy.get('#input-currency-input .token-amount-input')
      .clear()
      .type('0.001', { delay: 200 })
      .should('have.value', '0.001')
  })

  it.skip('zero swap amount', () => {
    cy.get('#input-currency-input .token-amount-input').clear().type('0.0', { delay: 200 }).should('have.value', '0.0')
  })

  it.skip('invalid swap amount', () => {
    cy.get('#input-currency-input .token-amount-input').clear().type('\\', { delay: 200 }).should('have.value', '')
  })

  it.skip('can enter an amount into output', () => {
    cy.get('#output-currency-input .token-amount-input').type('0.001', { delay: 200 }).should('have.value', '0.001')
  })

  it.skip('zero output amount', () => {
    cy.get('#output-currency-input .token-amount-input').type('0.0', { delay: 200 }).should('have.value', '0.0')
  })

  it.skip('can swap ETH for DAI', () => {
    cy.get('#output-currency-input .open-currency-select-button').click()
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').should('be.visible')
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').click({ force: true })
    cy.get('#input-currency-input .token-amount-input').should('be.visible')
    cy.get('#input-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
    cy.get('#output-currency-input .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  it.skip('add a recipient does not exist unless in expert mode', () => {
    cy.get('#add-recipient-button').should('not.exist')
  })

  it('ETH to wETH is same value (wrapped swaps have no price impact)', () => {
    cy.get('#output-currency-input .open-currency-select-button').click()
    cy.get('.token-item-0xc778417E063141139Fce010982780140Aa0cD5Ab').click({ force: true })
    cy.get('#input-currency-input .token-amount-input').type('0.01', { force: true, delay: 100 })
    cy.get('#output-currency-input .token-amount-input').should('have.value', '0.01')
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

    it.skip('add a recipient is visible', () => {
      cy.get('#add-recipient-button').should('be.visible')
    })

    it.skip('add a recipient', () => {
      cy.get('#add-recipient-button').click()
      cy.get('#recipient').should('exist')
    })

    it.skip('remove recipient', () => {
      cy.get('#add-recipient-button').click()
      cy.get('#remove-recipient-button').click()
      cy.get('#recipient').should('not.exist')
    })
  })
})
