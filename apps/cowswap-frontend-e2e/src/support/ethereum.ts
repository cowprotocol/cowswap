/**
 * Updates cy.visit() to include an injected window.ethereum provider.
 */
import { Address, createPublicClient, createWalletClient, Hex, http, PublicClient, toHex, WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

const CHAIN_ID = 11155111

const rawPrivateKey = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY') as string
assert(rawPrivateKey, 'INTEGRATION_TEST_PRIVATE_KEY env missing')
// Ensure private key has 0x prefix for viem
const INTEGRATION_TEST_PRIVATE_KEY: Hex = rawPrivateKey.startsWith('0x')
  ? (rawPrivateKey as Hex)
  : (`0x${rawPrivateKey}` as Hex)

const INTEGRATION_TESTS_INFURA_KEY = Cypress.env('INTEGRATION_TESTS_INFURA_KEY')
const INTEGRATION_TESTS_ALCHEMY_KEY = Cypress.env('INTEGRATION_TESTS_ALCHEMY_KEY')

const NETWORK_URL = Cypress.env('REACT_APP_NETWORK_URL_' + CHAIN_ID)

const PROVIDER_URL =
  NETWORK_URL ||
  (INTEGRATION_TESTS_ALCHEMY_KEY
    ? `https://eth-sepolia.g.alchemy.com/v2/${INTEGRATION_TESTS_ALCHEMY_KEY}`
    : INTEGRATION_TESTS_INFURA_KEY
      ? `https://sepolia.infura.io/v3/${INTEGRATION_TESTS_INFURA_KEY}`
      : undefined)

assert(
  PROVIDER_URL,
  `PROVIDER_URL is empty, NETWORK_URL=${NETWORK_URL}, INTEGRATION_TESTS_ALCHEMY_KEY=${INTEGRATION_TESTS_ALCHEMY_KEY}, INTEGRATION_TESTS_INFURA_KEY=${INTEGRATION_TESTS_INFURA_KEY}`,
)

const account = privateKeyToAccount(INTEGRATION_TEST_PRIVATE_KEY)

// address of the above key
export const TEST_ADDRESS_NEVER_USE = account.address

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(PROVIDER_URL),
})

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(PROVIDER_URL),
})

// Custom EIP-1193 provider for e2e testing
class CustomizedBridge {
  autoConnect = true
  chainId = CHAIN_ID
  provider: PublicClient
  walletClient: WalletClient
  address: Address

  constructor(walletClient: WalletClient, provider: PublicClient, address: Address) {
    this.walletClient = walletClient
    this.provider = provider
    this.address = address
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  async sendAsync(...args: any[]) {
    console.debug('sendAsync called', ...args)
    return this.send(...args)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity, @typescript-eslint/no-explicit-any, max-lines-per-function
  async send(...args: any[]) {
    console.debug('send called', ...args)
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback: Function | undefined
    let method: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let params: any[]
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
        callback!({ result: [TEST_ADDRESS_NEVER_USE] })
        return
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE])
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback!(null, { result: `0x${CHAIN_ID.toString(16)}` })
        return
      } else {
        return Promise.resolve(`0x${CHAIN_ID.toString(16)}`)
      }
    }
    try {
      // If from is present on eth_call it errors, removing it makes the library set
      // from as the connected wallet which works fine
      if (params && params.length && params[0].from && method === 'eth_call') delete params[0].from
      let result: unknown
      // For sending a transaction if we call send it will error
      // as it wants gasLimit in sendTransaction but hexlify sets the property gas
      // to gasLimit which makes send transaction error.
      if (params && params.length && params[0].from && method === 'eth_sendTransaction') {
        const txParams = params[0]
        // If from is present on eth_sendTransaction it errors
        delete txParams.from

        const hash = await this.walletClient.sendTransaction({
          account: this.address,
          to: txParams.to as Address,
          data: txParams.data as Hex | undefined,
          value: txParams.value ? BigInt(txParams.value) : undefined,
          gas: txParams.gas ? BigInt(txParams.gas) : txParams.gasLimit ? BigInt(txParams.gasLimit) : undefined,
          chain: sepolia,
        })
        result = hash
      } else if (method === 'eth_call') {
        result = await this.provider.call({
          to: params[0]?.to as Address,
          data: params[0]?.data as Hex,
        })
      } else if (method === 'eth_getBalance') {
        const balance = await this.provider.getBalance({
          address: params[0] as Address,
          blockTag: params[1] as 'latest' | 'pending' | 'earliest' | undefined,
        })
        result = toHex(balance)
      } else if (method === 'eth_blockNumber') {
        const blockNumber = await this.provider.getBlockNumber()
        result = toHex(blockNumber)
      } else if (method === 'eth_getTransactionReceipt') {
        const receipt = await this.provider.getTransactionReceipt({ hash: params[0] as Hex })
        result = receipt
      } else if (method === 'eth_estimateGas') {
        const gas = await this.provider.estimateGas({
          to: params[0].to as Address,
          data: params[0].data as Hex | undefined,
          value: params[0].value ? BigInt(params[0].value) : undefined,
        })
        result = toHex(gas)
      } else {
        // Fallback to raw request for other methods
        result = await this.provider.request({
          method: method as never,
          params: params as never,
        })
      }
      console.debug('result received', method, params, result)
      if (isCallbackForm) {
        callback!(null, { result })
        return
      } else {
        return result
      }
    } catch (error) {
      console.log(error)
      if (isCallbackForm) {
        callback!(error, null)
        return
      } else {
        throw error
      }
    }
  }
}

export const injected = new CustomizedBridge(walletClient, publicClient, account.address)
