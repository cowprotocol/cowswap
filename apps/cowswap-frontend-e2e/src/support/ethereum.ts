/**
 * Updates cy.visit() to include an injected window.ethereum provider.
 */
import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

const CHAIN_ID = 11155111
const CHAIN_NAME = 'sepolia'

const INTEGRATION_TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
assert(INTEGRATION_TEST_PRIVATE_KEY, 'INTEGRATION_TEST_PRIVATE_KEY env missing')

const INTEGRATION_TESTS_INFURA_KEY = Cypress.env('INTEGRATION_TESTS_INFURA_KEY')

const NETWORK_URL = Cypress.env('REACT_APP_NETWORK_URL_' + CHAIN_ID)

const PROVIDER_URL = NETWORK_URL || `https://${CHAIN_NAME}.infura.io/v3/${INTEGRATION_TESTS_INFURA_KEY}`

assert(
  PROVIDER_URL,
  `PROVIDER_URL is empty, NETWORK_URL=${NETWORK_URL}, INTEGRATION_TESTS_INFURA_KEY=${INTEGRATION_TESTS_INFURA_KEY}`
)

// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(INTEGRATION_TEST_PRIVATE_KEY).address

// Redefined bridge to fix a supper annoying issue making some contract calls to fail
//  See https://github.com/ethers-io/ethers.js/issues/1683
class CustomizedBridge extends Eip1193Bridge {
  autoConnect = true

  chainId = CHAIN_ID

  // TODO: Add proper return type annotation
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  async sendAsync(...args: any[]) {
    console.debug('sendAsync called', ...args)
    return this.send(...args)
  }
  // TODO: Break down this large function into smaller functions
  // TODO: Add proper return type annotation
  // TODO: Reduce function complexity by extracting logic
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity, @typescript-eslint/no-explicit-any
  async send(...args: any[]) {
    console.debug('send called', ...args)
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback
    let method
    let params
    if (isCallbackForm) {
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    // Mock out request accounts and chainId
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] })
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE])
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: `0x${CHAIN_ID.toString(16)}` })
      } else {
        return Promise.resolve(`0x${CHAIN_ID.toString(16)}`)
      }
    }
    try {
      // If from is present on eth_call it errors, removing it makes the library set
      // from as the connected wallet which works fine
      if (params && params.length && params[0].from && method === 'eth_call') delete params[0].from
      let result
      // For sending a transaction if we call send it will error
      // as it wants gasLimit in sendTransaction but hexlify sets the property gas
      // to gasLimit which makes sensd transaction error.
      // This have taken the code from the super method for sendTransaction and altered
      // it slightly to make it work with the gas limit issues.
      if (params && params.length && params[0].from && method === 'eth_sendTransaction') {
        // Hexlify will not take gas, must be gasLimit, set this property to be gasLimit
        params[0].gasLimit = params[0].gas
        delete params[0].gas
        // If from is present on eth_sendTransaction it errors, removing it makes the library set
        // from as the connected wallet which works fine
        delete params[0].from
        const req = JsonRpcProvider.hexlifyTransaction(params[0])
        // Hexlify sets the gasLimit property to be gas again and send transaction requires gasLimit
        req.gasLimit = req.gas
        delete req.gas
        // Send the transaction
        const tx = await this.signer.sendTransaction(req)
        result = tx.hash
      } else {
        // All other transactions the base class works for
        result = await super.send(method, params)
      }
      console.debug('result received', method, params, result)
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    } catch (error) {
      console.log(error)
      if (isCallbackForm) {
        callback(error, null)
      } else {
        throw error
      }
    }
  }
}

const provider = new JsonRpcProvider(PROVIDER_URL, CHAIN_ID)
const signer = new Wallet(INTEGRATION_TEST_PRIVATE_KEY, provider)

export const injected = new CustomizedBridge(signer, provider)
