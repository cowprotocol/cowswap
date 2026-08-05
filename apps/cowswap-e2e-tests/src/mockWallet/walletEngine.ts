import {
  createWalletClient,
  defineChain,
  http,
  toHex,
  type Address,
  type Chain,
  type Hex,
  type HttpTransport,
  type PrivateKeyAccount,
  type WalletClient,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'

export interface CreateWalletEngineOpts {
  privateKey: Hex
  chainId: number
  workerId: string
  proxyBaseUrl: string
  emit: (event: string, payload: unknown) => void
}

export interface RpcCallRecord {
  method: string
  params: unknown[]
  result?: unknown
  error?: RpcError
}

export type RpcEnvelope = { ok: true; result: unknown } | { ok: false; error: RpcError }

export interface RpcError {
  code: number
  message: string
  data?: unknown
}

export interface RpcRequest {
  method: string
  params?: unknown[]
}

export type RpcStub = (ctx: { method: string; params: unknown[]; chainId: number }) => unknown | Promise<unknown>

export interface WalletEngine {
  readonly address: Address
  readonly chainId: number
  handleRequest(req: RpcRequest): Promise<RpcEnvelope>
  setChainId(chainId: number): void
  stubRpc(method: string, handler: RpcStub | unknown): void
  restoreRpc(method: string): void
  rpcCalls(method?: string): RpcCallRecord[]
}

interface TransactionParams {
  to?: Address
  data?: Hex
  value?: string
  gas?: string
  gasLimit?: string
}

// eslint-disable-next-line max-lines-per-function
export function createWalletEngine(opts: CreateWalletEngineOpts): WalletEngine {
  const account = privateKeyToAccount(opts.privateKey)
  const stubs = new Map<string, RpcStub>()
  const calls: RpcCallRecord[] = []
  let chainId = opts.chainId

  const partitionUrl = (): string => `${opts.proxyBaseUrl}/rpc/${chainId}/${opts.workerId}`

  async function forward(method: string, params: unknown[]): Promise<unknown> {
    const res = await fetch(partitionUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
    const json = (await res.json()) as { result?: unknown; error?: { code?: number; message?: string } }
    if (json.error) {
      throw { code: json.error.code ?? -32000, message: json.error.message ?? 'RPC error' }
    }
    return json.result
  }

  function walletClient(): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    // Minimal ad-hoc chain: routes viem's fill+sign+submit pipeline through the proxy partition.
    const chain = defineChain({
      id: chainId,
      name: `e2e-${chainId}`,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [partitionUrl()] } },
    })
    return createWalletClient({ account, chain, transport: http(partitionUrl()) })
  }

  function setChainId(next: number): void {
    if (next === chainId) return
    chainId = next
    opts.emit('chainChanged', toHex(next))
  }

  // eslint-disable-next-line complexity
  async function dispatch(method: string, params: unknown[]): Promise<unknown> {
    const stub = stubs.get(method)
    if (stub) return stub({ method, params, chainId })

    switch (method) {
      case 'eth_accounts':
      case 'eth_requestAccounts':
        return [account.address]
      case 'eth_chainId':
        return toHex(chainId)
      case 'net_version':
        return String(chainId)
      case 'personal_sign':
        // params: [hexMessage, address]
        return account.signMessage({ message: { raw: params[0] as Hex } })
      case 'eth_signTypedData_v4': {
        // params: [address, jsonTypedData]; viem rejects an explicit EIP712Domain entry in types.
        const typed = JSON.parse(params[1] as string)
        const { EIP712Domain: _domain, ...types } = typed.types ?? {}
        return account.signTypedData({ ...typed, types })
      }
      case 'eth_sendTransaction': {
        const tx = (params[0] ?? {}) as TransactionParams
        const gas = tx.gas ?? tx.gasLimit
        return walletClient().sendTransaction({
          to: tx.to,
          data: tx.data,
          value: tx.value !== undefined ? BigInt(tx.value) : undefined,
          gas: gas !== undefined ? BigInt(gas) : undefined,
        })
      }
      case 'wallet_switchEthereumChain': {
        const target = (params[0] as { chainId: string }).chainId
        setChainId(Number(target))
        return null
      }
      case 'wallet_addEthereumChain':
        return null
      case 'wallet_getCapabilities':
        return {}
      case 'wallet_requestPermissions':
        return [{ parentCapability: 'eth_accounts' }]
      case 'wallet_revokePermissions':
        return null
      default:
        return forward(method, params)
    }
  }

  return {
    get address() {
      return account.address
    },
    get chainId() {
      return chainId
    },
    setChainId,
    async handleRequest({ method, params = [] }) {
      try {
        const result = await dispatch(method, params)
        calls.push({ method, params, result })
        return { ok: true, result }
      } catch (e) {
        const error = toRpcError(e)
        calls.push({ method, params, error })
        return { ok: false, error }
      }
    },
    stubRpc(method, handler) {
      stubs.set(method, typeof handler === 'function' ? (handler as RpcStub) : () => handler)
    },
    restoreRpc(method) {
      stubs.delete(method)
    },
    rpcCalls(method) {
      return method ? calls.filter((c) => c.method === method) : [...calls]
    },
  }
}

function toRpcError(e: unknown): RpcError {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const err = e as { code?: unknown; message: unknown; data?: unknown }
    return {
      code: typeof err.code === 'number' ? err.code : -32000,
      message: String(err.message),
      ...(err.data !== undefined ? { data: err.data } : {}),
    }
  }
  return { code: -32000, message: String(e) }
}
