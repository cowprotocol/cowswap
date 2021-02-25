function _clickOnToken(inputOrOutput) {
  cy.get(`#swap-currency-${inputOrOutput} .open-currency-select-button`).click()
}

function _selectTokenFromSelector(tokenAddress, inputOrOutput) {
  cy.get(`#swap-currency-${inputOrOutput} .open-currency-select-button`).click({ force: true })
  cy.get('.token-item-' + tokenAddress).should('be.visible')
  cy.get('.token-item-' + tokenAddress).click({ force: true })
  cy.get(`#swap-currency-${inputOrOutput} .token-amount-${inputOrOutput}`).should('be.visible')
}

function _responseHandlerFactory(body) {
  return req =>
    req.reply(res => {
      const newBody = JSON.stringify(body || res.body)
      res.body = newBody
    })
}

function clickInputToken() {
  _clickOnToken('input')
}

function clickOutputToken() {
  _clickOnToken('output')
}

function selectOutput(tokenAddress) {
  clickOutputToken()
  _selectTokenFromSelector(tokenAddress, 'output')
}

function selectInput(tokenAddress) {
  clickInputToken()
  _selectTokenFromSelector(tokenAddress, 'input')
}

function stubResponse({ url, alias = 'stubbedResponse', body }) {
  cy.intercept({ method: 'GET', url }, _responseHandlerFactory(body)).as(alias)
}

Cypress.Commands.add('swapClickInputToken', () => clickInputToken)
Cypress.Commands.add('swapClickOutputToken', () => clickOutputToken)
Cypress.Commands.add('swapSelectInput', selectInput)
Cypress.Commands.add('swapSelectOutput', selectOutput)
Cypress.Commands.add('stubResponse', stubResponse)
