describe('Lists', () => {
  beforeEach(() => {
    cy.visit('/swap')
  })

  it('change list', () => {
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get('.list-token-manage-button').click()
    cy.get('#tokens-lists-table > div').should('have.length.greaterThan', 1)
  })
})
