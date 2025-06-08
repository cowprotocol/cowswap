// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getInputFiatAmount() {
  return cy.get('#input-currency-input .fiat-amount').invoke('text')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getInputToken() {
  return cy.get('#input-currency-input .token-amount-input').should('be.enabled')
}

function parseFiatAmountText(text: string): number {
  return +text.split('$')[1].replace(/,/g, '')
}

describe('Fiat amounts', () => {
  beforeEach(() => {
    cy.visit('/#/11155111/swap/WETH/COW')
  })

  it('Should change fiat amount after changing currency amount', () => {
    getInputToken().type('1')

    // Get fiat amount for 1 WETH
    getInputFiatAmount().then((fiatAmountOneText) => {
      const fiatAmountOne = parseFiatAmountText(fiatAmountOneText)

      // Input 2 WETH
      getInputToken().clear().type('2')

      // Get fiat amount for 2 WETH
      getInputFiatAmount().then((fiatAmountTwoText) => {
        const fiatAmountTwo = parseFiatAmountText(fiatAmountTwoText)
        const onePercent = fiatAmountOne * 0.01

        // Check that fiat amount of 2 WETH is ~2x fiat amount of 1 WETH
        expect(fiatAmountTwo).to.closeTo(fiatAmountOne * 2, onePercent)
      })
    })
  })
})
