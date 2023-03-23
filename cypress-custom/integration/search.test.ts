describe('Search', () => {
  beforeEach(() => {
    cy.visit('/#/swap')
  })

  it('should be able to find a token by its name', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('DAI')
    cy.get('#currency-list').first().contains('Dai Stablecoin')
  })

  it('should be able to find a token by its address', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('0x6B175474E89094C44Da98b954EedeAC495271d0F')
    cy.get('#currency-list').first().contains('Dai Stablecoin')
  })

  it('should be able to find a token by its address with case errors at the beginning', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('0X6B175474E89094C44Da98b954EedeAC495271d0F')
    cy.get('#currency-list').first().contains('Dai Stablecoin')
  })

  it('should be able to find a token by its address with case errors in the address', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('0x6B175474E89094C44DA98B954eedeAC495271d0F')
    cy.get('#currency-list').first().contains('Dai Stablecoin')
  })

  it('should be able to find a token by its address without 0x at the start', () => {
    cy.get('.open-currency-select-button').first().click()
    cy.get('#token-search-input').type('6B175474E89094C44Da98b954EedeAC495271d0F')
    cy.get('#currency-list').first().contains('Dai Stablecoin')
  })
})
