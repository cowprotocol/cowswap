describe('Send', () => {
  it('should redirect', () => {
    cy.visit('/send')
    cy.url().should('include', '/swap')
  })

  it('should redirect with url params', () => {
    cy.visit('/send?outputCurrency=ETH&recipient=bob.argent.xyz')
    cy.get('#recipient input').should('have.value', 'bob.argent.xyz')
    cy.get('#swap-currency-output .token-symbol-container').should('contain.text', 'ETH')
  })
})
