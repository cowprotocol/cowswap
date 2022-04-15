/// <reference types="Cypress" />

declare namespace Cypress {
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
     * @example cy.clickOutputToken()
     */
    clickOutputToken(): Chainable<Subject>

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
      body?: any
    }): Chainable<Subject>
  }
}
