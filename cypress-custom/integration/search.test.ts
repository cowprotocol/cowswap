describe('Search', () => {
  beforeEach(() => {
    cy.visit('/#/swap')
  })

  it('should be able to find a token by its name', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('DAI')
    cy.get('#currency-list').first().contains('DAI')
  })

  it('should be able to find a token by its address', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('0xdc31ee1784292379fbb2964b3b9c4124d8f89c60')
    cy.get('#currency-list').first().contains('DAI')
  })

  it('should be able to find a token by its address with case errors at the beginning', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('0Xdc31ee1784292379fbb2964b3b9c4124d8f89c60')
    cy.get('#currency-list').first().contains('DAI')
  })

  it('should be able to find a token by its address with case errors in the address', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('0xDC31EE1784292379fbb2964b3b9c4124d8f89c60')
    cy.get('#currency-list').first().contains('DAI')
  })

  it('should be able to find a token by its address without 0x at the start', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('dc31ee1784292379fbb2964b3b9c4124d8f89c60')
    cy.get('#currency-list').first().contains('DAI')
  })
})
