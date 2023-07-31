const ETHERS_EXPECTED_ERROR = 'could not detect network (event="noNetwork"'
const INVALID_ARGUMENT_ERROR = 'invalid argument 0'

Cypress.on('uncaught:exception', (err) => {
  // we expect an ethers library error with message 'could not detect network ...' we're always testing rinkeby anyways
  // and don't want to fail the test so we return false
  if (err.message.includes(ETHERS_EXPECTED_ERROR) || err.message.includes(INVALID_ARGUMENT_ERROR)) {
    return false
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
})
