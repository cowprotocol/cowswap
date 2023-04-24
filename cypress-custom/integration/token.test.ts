describe('Tokens', () => {
  beforeEach(() => {
    cy.visit('/#/account/tokens?chain=goerli')
  })

  it('should be able to find a token by its name', () => {
    cy.get('#token-search-input').type('cow')
    cy.get('#tokens-table').contains('CoW Protocol Token')
  })

  it('should be able to find a token by its address', () => {
    cy.get('#token-search-input').type('0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60')
    cy.get('#tokens-table').contains('DAI')
  })

  it('should be able to find a token by its address with case errors', () => {
    cy.get('#token-search-input').type('0XdC31eE1784292379fBB2964b3B9C4124D8F89C60')
    cy.get('#tokens-table').contains('DAI')
  })
})
