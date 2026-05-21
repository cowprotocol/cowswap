/**
 * Updates cy.visit() to include an injected window.ethereum provider.
 */
import { Address, createPublicClient, createWalletClient, Hex, http, PublicClient, toHex, WalletClient } from 'viem'

import EventEmitter from 'eventemitter3'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

const CHAIN_ID = 11155111
const CHAIN_NAME = 'sepolia'

const RAW_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY') as string
assert(RAW_PRIVATE_KEY, 'INTEGRATION_TEST_PRIVATE_KEY env missing')

const INTEGRATION_TEST_PRIVATE_KEY: Hex = RAW_PRIVATE_KEY.startsWith('0x')
  ? (RAW_PRIVATE_KEY as Hex)
  : `0x${RAW_PRIVATE_KEY}`

const INTEGRATION_TESTS_ALCHEMY_KEY = Cypress.env('INTEGRATION_TESTS_ALCHEMY_KEY') as string | undefined
const INTEGRATION_TESTS_INFURA_KEY = Cypress.env('INTEGRATION_TESTS_INFURA_KEY') as string | undefined
const NETWORK_URL = Cypress.env('REACT_APP_NETWORK_URL_' + CHAIN_ID) as string | undefined

const PROVIDER_URL =
  NETWORK_URL ??
  (INTEGRATION_TESTS_ALCHEMY_KEY
    ? `https://eth-${CHAIN_NAME}.g.alchemy.com/v2/${INTEGRATION_TESTS_ALCHEMY_KEY}`
    : INTEGRATION_TESTS_INFURA_KEY
      ? `https://${CHAIN_NAME}.infura.io/v3/${INTEGRATION_TESTS_INFURA_KEY}`
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

interface CallRequest {
  to?: string
  data?: string
}

interface EIP1193Request {
  method: string
  params?: unknown[]
}

type RpcCallback = (error: Error | null, result: { result: unknown } | null) => void

interface TransactionRequest {
  to: string
  data?: string
  value?: string
  gas?: string
  gasLimit?: string
}

// Custom EIP-1193 provider for e2e testing.
// Acts as window.ethereum — wagmi/reown calls request() to connect and sign transactions.
class CustomizedBridge extends EventEmitter {
  readonly chainId = CHAIN_ID
  readonly address: Address = account.address
  private readonly publicClient: PublicClient
  private readonly walletClient: WalletClient

  constructor(walletClient: WalletClient, publicClient: PublicClient) {
    super()
    this.walletClient = walletClient
    this.publicClient = publicClient
  }

  // eslint-disable-next-line complexity
  async request({ method, params = [] }: EIP1193Request): Promise<unknown> {
    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return [TEST_ADDRESS_NEVER_USE]

      case 'eth_chainId':
        return toHex(CHAIN_ID)

      case 'net_version':
        return String(CHAIN_ID)

      case 'wallet_switchEthereumChain':
      case 'wallet_addEthereumChain':
        return null

      case 'eth_sendTransaction': {
        const tx = params[0] as TransactionRequest
        return this.walletClient.sendTransaction({
          account: account.address,
          to: tx.to as Address,
          data: tx.data as Hex | undefined,
          value: tx.value !== undefined ? BigInt(tx.value) : undefined,
          gas: tx.gas !== undefined ? BigInt(tx.gas) : tx.gasLimit !== undefined ? BigInt(tx.gasLimit) : undefined,
          chain: sepolia,
        })
      }

      case 'eth_call': {
        const callParams = params[0] as CallRequest
        const result = await this.publicClient.call({
          to: callParams.to as Address,
          data: callParams.data as Hex | undefined,
        })
        return result.data ?? '0x'
      }

      case 'eth_getBalance': {
        const balance = await this.publicClient.getBalance({
          address: params[0] as Address,
          blockTag: (params[1] as 'latest' | 'pending' | 'earliest') ?? 'latest',
        })
        return toHex(balance)
      }

      case 'eth_blockNumber': {
        const blockNumber = await this.publicClient.getBlockNumber()
        return toHex(blockNumber)
      }

      case 'eth_getTransactionReceipt':
        return this.publicClient.waitForTransactionReceipt({ hash: params[0] as Hex })

      case 'eth_estimateGas': {
        const txParams = params[0] as CallRequest & { value?: string }
        const gas = await this.publicClient.estimateGas({
          to: txParams.to as Address,
          data: txParams.data as Hex | undefined,
          value: txParams.value !== undefined ? BigInt(txParams.value) : undefined,
        })
        return toHex(gas)
      }

      default:
        return this.publicClient.request({ method: method as never, params: params as never })
    }
  }

  // Legacy Web3 1.x callback form: send({ method, params }, callback)
  send(request: EIP1193Request, callback: RpcCallback): void
  // Legacy Web3 1.x promise form: send(method, params?)
  send(method: string, params?: unknown[]): Promise<unknown>
  send(methodOrRequest: string | EIP1193Request, paramsOrCallback?: unknown[] | RpcCallback): Promise<unknown> | void {
    if (typeof methodOrRequest === 'object' && typeof paramsOrCallback === 'function') {
      const callback = paramsOrCallback as RpcCallback
      this.request(methodOrRequest)
        .then((result) => callback(null, { result }))
        .catch((error: Error) => callback(error, null))
      return
    }
    return this.request({
      method: methodOrRequest as string,
      params: paramsOrCallback as unknown[] | undefined,
    })
  }
}

export const injected = new CustomizedBridge(walletClient, publicClient)
