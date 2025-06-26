// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function openTokenSelector() {
  cy.get('.open-currency-select-button').first({ timeout: 20_000 }).should('be.enabled').click()
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Search', () => {
  beforeEach(() => {
    cy.visit('/#/11155111/swap/')
  })

  it('should be able to find a token by its name', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('COW')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should be able to find a token by its address', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('0x0625aFB445C3B6B7B929342a04A22599fd5dBB59')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should be able to find a token by its address with case errors at the beginning', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('0x0625aFB445C3B6B7B929342a04A22599fd5dBB59')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should be able to find a token by its address with case errors in the address', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('0x0625aFB445C3B6B7B929342a04A22599fd5dBB59')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should be able to find a token by its address without 0x at the start', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('0625aFB445C3B6B7B929342a04A22599fd5dBB59')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should be able to find a token by its address when there is a trailing or leading space', () => {
    openTokenSelector()
    cy.get('#token-search-input').type(' 0x0625aFB445C3B6B7B929342a04A22599fd5dBB59 ')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should be able to find a token by its name when there is a trailing or leading space', () => {
    openTokenSelector()
    cy.get('#token-search-input').type(' COW ')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'GNO')
  })

  it('should not show import when token is in our lists', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('0x0625aFB445C3B6B7B929342a04A22599fd5dBB59')
    cy.get('#currency-list').contains('COW')
    cy.get('#currency-list').should('not.contain.text', 'Import')
  })

  it('should show import when token is unknown to us', () => {
    openTokenSelector()
    cy.get('#token-search-input').type('0x779877A7B0D9E8603169DdbD7836e478b4624789')
    cy.get('#currency-import').contains('LINK')
    cy.get('#currency-import').contains('Import')
  })
})
