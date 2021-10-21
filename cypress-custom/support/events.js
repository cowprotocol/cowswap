const ETHERS_EXPECTED_ERROR = 'could not detect network (event="noNetwork"'

Cypress.on('uncaught:exception', (err) => {
  // we expect an ethers library error with message 'could not detect network ...' we're always testing rinkeby anyways
  // and don't want to fail the test so we return false
  if (err.message.includes(ETHERS_EXPECTED_ERROR)) {
    return false
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
})
