describe('Tokens', () => {
  beforeEach(() => {
    cy.visit('/#/account/tokens?chain=sepolia')
  })

  it('should be able to find a token by its name', () => {
    cy.get('#token-search-input').type('cow')
    cy.get('#tokens-table').contains('CoW Protocol Token')
  })

  it('should be able to find a token by its address', () => {
    cy.get('#token-search-input').type('0x0625aFB445C3B6B7B929342a04A22599fd5dBB59')
    cy.get('#tokens-table').contains('COW')
  })

  it('should be able to find a token by its address with case errors', () => {
    cy.get('#token-search-input').type('0X0625AFB445C3B6B7B929342A04A22599FD5DBB59')
    cy.get('#tokens-table').contains('COW')
  })
})
