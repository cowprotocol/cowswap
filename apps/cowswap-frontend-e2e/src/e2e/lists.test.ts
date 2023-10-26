describe('Lists', () => {
  beforeEach(() => {
    cy.visit('/#/5/swap/')
  })

  it('change list', () => {
    cy.get('#output-currency-input .open-currency-select-button').click()
    cy.get('#list-token-manage-button').click()
    cy.get('#tokens-lists-table > div').should('have.length.greaterThan', 1)
  })
})
