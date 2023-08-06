describe('Send', () => {
  it('should redirect', () => {
    cy.visit('/#/send')
    cy.url().should('include', '/swap')
  })

  // TODO: this tests doesn't work on CI, but works locally. Should be fixed
  // it('should redirect with url params', () => {
  //   cy.visit('/send?inputCurrency=USDC&outputCurrency=ETH&recipient=bob.argent.xyz')
  //   cy.get('#recipient input').should('have.value', 'bob.argent.xyz')
  //   cy.get('#output-currency-input .token-symbol-container').should('contain.text', 'ETH')
  // })
})
