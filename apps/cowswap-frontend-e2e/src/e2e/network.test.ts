describe('Network', () => {
  it('When network is changed, then should reset swap form state', () => {
    // GIVEN: current network is Goerli, wallet is not connected
    cy.visit('/#/5/swap/GNO/COW')
    cy.get('#web3-status-connected').click()

    cy.get('#account-orders-panel').then((el) => {
      /**
       * Disable css smooth scroll, that doesn't plays nice with cypress.
       * See https://github.com/cypress-io/cypress/issues/3200
       */
      el.css('scroll-behavior', 'auto')
      el.scrollTop(0)
    })

    cy.screenshot()
    cy.get('#disconnect-btn').click()

    // WHEN: network changes to Gnosis chain
    cy.get('#network-select-btn').trigger('mouseover')
    cy.get('div[data-network-id="100"]').click()

    // THEN: sell token is WXDAI and buy token is empty
    cy.get('#input-currency-input .token-symbol-container').should('contain', 'WXDAI')
    cy.get('#output-currency-input .token-symbol-container').should('contain.text', 'Select a token')
  })
})
