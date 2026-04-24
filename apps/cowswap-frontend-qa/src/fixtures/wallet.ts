import { createPublicClient, http, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

import type { Page } from '@playwright/test'

const REQUEST_BRIDGE_NAME = '__cowQaWalletRequest'
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex
const TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY)
const CHAIN_ID = 1
const CHAIN_ID_HEX = '0x1'
const NOT_HANDLED = Symbol('NOT_HANDLED')

export const TEST_WALLET_ADDRESS = TEST_ACCOUNT.address

type WalletPublicClient = ReturnType<typeof createPublicClient>
type WalletState = {
  connected: boolean
}

interface ProviderRpcError extends Error {
  code: number
}

interface WalletInstallOptions {
  rpcUrl: string
}

interface WalletRpcRequest {
  method: string
  params?: unknown[]
}

function createProviderRpcError(code: number, message: string): ProviderRpcError {
  const error = new Error(message) as ProviderRpcError
  error.code = code
  return error
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }

  return {}
}

function normalizeChainId(chainId: string): string {
  try {
    return `0x${BigInt(chainId).toString(16)}`
  } catch {
    return chainId.toLowerCase()
  }
}

function getRequestedChainId(value: unknown): string | null {
  const record = toRecord(value)
  return typeof record.chainId === 'string' ? normalizeChainId(record.chainId) : null
}

function withDefaultFrom(value: unknown, address: string): Record<string, unknown> {
  const record = toRecord(value)

  return {
    ...record,
    from: typeof record.from === 'string' ? record.from : address,
  }
}

function handleWalletAuthorizationRequest(
  accountAddress: string,
  state: WalletState,
  method: string,
): typeof NOT_HANDLED | string[] {
  switch (method) {
    case 'eth_requestAccounts':
      state.connected = true
      return [accountAddress]
    case 'eth_accounts':
      return state.connected ? [accountAddress] : []
    default:
      return NOT_HANDLED
  }
}

function handleWalletNetworkRequest(method: string, params: unknown[]): typeof NOT_HANDLED | string | null {
  switch (method) {
    case 'eth_chainId':
      return CHAIN_ID_HEX
    case 'net_version':
      return String(CHAIN_ID)
    case 'wallet_switchEthereumChain': {
      const requestedChainId = getRequestedChainId(params[0])

      if (requestedChainId === CHAIN_ID_HEX) {
        return null
      }

      throw createProviderRpcError(4902, `Unsupported chain ${requestedChainId ?? 'unknown'}`)
    }
    case 'wallet_addEthereumChain':
      return null
    default:
      return NOT_HANDLED
  }
}

async function handleWalletRpcRequest(
  publicClient: WalletPublicClient,
  accountAddress: string,
  { method, params = [] }: WalletRpcRequest,
): Promise<unknown> {
  switch (method) {
    case 'eth_sendTransaction':
      return publicClient.request({
        method: 'eth_sendTransaction' as never,
        params: [withDefaultFrom(params[0], accountAddress)] as never,
      })
    case 'eth_call': {
      const blockTag = typeof params[1] === 'string' ? params[1] : 'latest'

      return publicClient.request({
        method: 'eth_call' as never,
        params: [withDefaultFrom(params[0], accountAddress), blockTag] as never,
      })
    }
    case 'eth_estimateGas':
      return publicClient.request({
        method: 'eth_estimateGas' as never,
        params: [withDefaultFrom(params[0], accountAddress)] as never,
      })
    case 'eth_sign':
    case 'personal_sign':
    case 'eth_signTypedData':
    case 'eth_signTypedData_v4':
      return publicClient.request({
        method: method as never,
        params: params as never,
      })
    default:
      return publicClient.request({
        method: method as never,
        params: params as never,
      })
  }
}

function createWalletRequestHandler(publicClient: WalletPublicClient, accountAddress: string) {
  const state: WalletState = { connected: false }

  return async (request: WalletRpcRequest): Promise<unknown> => {
    const authorizationResult = handleWalletAuthorizationRequest(accountAddress, state, request.method)
    if (authorizationResult !== NOT_HANDLED) {
      return authorizationResult
    }

    const networkResult = handleWalletNetworkRequest(request.method, request.params ?? [])
    if (networkResult !== NOT_HANDLED) {
      return networkResult
    }

    return handleWalletRpcRequest(publicClient, accountAddress, request)
  }
}

function initializeInjectedWalletProvider(initData: {
  address: string
  chainId: string
  requestBridgeName: string
}): void {
  type Listener = (...args: unknown[]) => void
  type RpcRequest = { method: string; params?: unknown[] }
  type BridgeWindow = Window &
    typeof globalThis & {
      [key: string]: ((request: RpcRequest) => Promise<unknown>) | unknown
      ethereum?: unknown
    }

  const listeners = new Map<string, Set<Listener>>()
  const emit = (eventName: string, ...args: unknown[]): void => {
    listeners.get(eventName)?.forEach((listener) => listener(...args))
  }
  const provider = {
    autoRefreshOnNetworkChange: false,
    chainId: initData.chainId,
    isMetaMask: false,
    providers: [] as unknown[],
    selectedAddress: null as string | null,
    connected: false,
    addListener(eventName: string, listener: Listener) {
      return this.on(eventName, listener)
    },
    emit,
    isConnected() {
      return this.connected
    },
    off(eventName: string, listener: Listener) {
      return this.removeListener(eventName, listener)
    },
    on(eventName: string, listener: Listener) {
      const currentListeners = listeners.get(eventName) ?? new Set<Listener>()
      currentListeners.add(listener)
      listeners.set(eventName, currentListeners)
      return this
    },
    removeListener(eventName: string, listener: Listener) {
      listeners.get(eventName)?.delete(listener)
      return this
    },
    async request({ method, params = [] }: RpcRequest): Promise<unknown> {
      const bridge = (window as BridgeWindow)[initData.requestBridgeName]
      if (typeof bridge !== 'function')
        throw new Error(`Wallet bridge "${initData.requestBridgeName}" is not available`)

      const result = await bridge({ method, params })
      if (method === 'eth_requestAccounts') {
        this.connected = true
        this.selectedAddress = initData.address
        emit('accountsChanged', result)
        emit('connect', { chainId: initData.chainId })
      }
      if (method === 'eth_accounts' && Array.isArray(result) && result.length > 0) {
        this.connected = true
        this.selectedAddress = initData.address
      }
      if (method === 'wallet_switchEthereumChain') {
        emit('chainChanged', initData.chainId)
      }

      return result
    },
  }

  provider.providers = [provider]
  Object.defineProperty(window as BridgeWindow, 'ethereum', {
    configurable: true,
    enumerable: true,
    value: provider,
    writable: true,
  })
  window.dispatchEvent(new Event('ethereum#initialized'))
}

async function installBrowserInjectedWallet(page: Page, accountAddress: string): Promise<void> {
  await page.addInitScript(initializeInjectedWalletProvider, {
    address: accountAddress,
    chainId: CHAIN_ID_HEX,
    requestBridgeName: REQUEST_BRIDGE_NAME,
  })
}

export async function installInjectedWallet(page: Page, { rpcUrl }: WalletInstallOptions): Promise<void> {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  })

  await page.exposeFunction(REQUEST_BRIDGE_NAME, createWalletRequestHandler(publicClient, TEST_WALLET_ADDRESS))
  await installBrowserInjectedWallet(page, TEST_WALLET_ADDRESS)
}
