// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    /**
     * Select token output in the swap page
     *
     * @example cy.swapSelectOutput(tokenAddress)
     */
    swapSelectOutput(tokenAddress: string): Chainable<Subject>

    /**
     * Select token input in the swap page
     *
     * @example cy.swapSelectInput(tokenAddress)
     */
    swapSelectInput(tokenAddress: string): Chainable<Subject>

    /**
     * Select token input in the swap page & input amount
     *
     * @example cy.swapEnterInputAmount(tokenAddress, amount)
     */
    swapEnterInputAmount(tokenAddress: string, amount: string | number, selectToken?: boolean): Chainable<Subject>

    /**
     * Select token output in the swap page & input amount
     *
     * @example cy.swapEnterOutputAmount(tokenAddress, amount)
     */
    swapEnterOutputAmount(tokenAddress: string, amount: string | number, selectToken?: boolean): Chainable<Subject>

    /**
     * Click on the input token
     *
     * @example cy.swapClickInputToken()
     */
    swapClickInputToken(): Chainable<Subject>

    /**
     * Click on the output token
     *
     * @example cy.swapClickOutputToken()
     */
    swapClickOutputToken(): Chainable<Subject>

    /**
     * Click on the output token
     *
     * @example cy.clickOutputToken()
     */
    clickOutputToken(): Chainable<Subject>

    /**
     * Pick the 'input' or 'output' token
     *
     * @example cy.pickToken('DAI', 'input')
     */
    pickToken(symbol: string, role: 'input' | 'output'): Chainable<Subject>

    /**
     * Set a stubbing intercept on route specified
     *
     * @example cy.stubResponse({ url: '/api/v1/someEndpoint/', alias: 'endpoint', body: { foo: 'foo' } })
     */
    stubResponse({
      method,
      url,
      alias,
      body,
    }: {
      method: 'GET' | 'POST' | 'DELETE'
      url: string
      alias?: string
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body?: any
    }): Chainable<Subject>
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _clickOnToken(inputOrOutput: string) {
  cy.get(`#${inputOrOutput}-currency-input .open-currency-select-button`, { timeout: 20_000 })
    .should('not.be.disabled')
    .click()
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _selectTokenFromSelector(tokenAddress: string, inputOrOutput: string) {
  cy.get(`#tokens-list button[data-address="${tokenAddress.toLowerCase()}"]`)
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true })

  cy.get(`#${inputOrOutput}-currency-input .token-amount-input`).should('be.visible')
}

function _responseHandlerFactory(body: string) {
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: any) =>
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.reply((res: any) => {
      const newBody = JSON.stringify(body || res.body)
      res.body = newBody
    })
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function clickInputToken() {
  _clickOnToken('input')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function clickOutputToken() {
  _clickOnToken('output')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function selectOutput(tokenAddress: string) {
  clickOutputToken()
  _selectTokenFromSelector(tokenAddress, 'output')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function selectInput(tokenAddress: string) {
  clickInputToken()
  _selectTokenFromSelector(tokenAddress, 'input')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function pickToken(symbol: string, role: string) {
  cy.get(`#${role}-currency-input .open-currency-select-button`, { timeout: 20_000 }).should('be.enabled').click()
  cy.get('#token-search-input').type(symbol)
  cy.get('#currency-list').get('div').contains(symbol).click({ force: true })
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function enterInputAmount(tokenAddress: string, amount: number | string, selectToken = false) {
  // Choose whether to also select token
  // or just input amount
  if (selectToken) {
    selectInput(tokenAddress)
  }

  cy.get('#input-currency-input .token-amount-input').type(amount.toString(), { force: true, delay: 400 })
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function enterOutputAmount(tokenAddress: string, amount: number | string, selectToken = false) {
  // Choose whether to also select token
  // or just input amount
  if (selectToken) {
    selectOutput(tokenAddress)
  }
  cy.get('#input-currency-input .token-amount-output').type(amount.toString(), { force: true, delay: 400 })
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function stubResponse({
  method,
  url,
  alias = 'stubbedResponse',
  body,
}: {
  method: string
  url: string
  alias?: string
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
}) {
  cy.intercept({ method, url }, _responseHandlerFactory(body)).as(alias)
}

Cypress.Commands.add('swapClickInputToken', clickInputToken)
Cypress.Commands.add('swapClickOutputToken', clickOutputToken)
Cypress.Commands.add('swapSelectInput', selectInput)
Cypress.Commands.add('swapSelectOutput', selectOutput)
Cypress.Commands.add('swapEnterInputAmount', enterInputAmount)
Cypress.Commands.add('swapEnterOutputAmount', enterOutputAmount)
Cypress.Commands.add('pickToken', pickToken)
Cypress.Commands.add('stubResponse', stubResponse)
