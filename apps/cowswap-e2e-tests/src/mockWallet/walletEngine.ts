import { toHex, type Address, type Hex } from 'viem'

import { privateKeyToAccount } from 'viem/accounts'

export interface CreateWalletEngineOpts {
  privateKey: Hex
  chainId: number
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

// eslint-disable-next-line max-lines-per-function
export function createWalletEngine(opts: CreateWalletEngineOpts): WalletEngine {
  const account = privateKeyToAccount(opts.privateKey)
  const stubs = new Map<string, RpcStub>()
  const calls: RpcCallRecord[] = []
  let chainId = opts.chainId

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
        const rawTypedData = params[1]
        if (typeof rawTypedData !== 'string') {
          throw new Error('eth_signTypedData_v4: expected params[1] to be a JSON-encoded string')
        }
        const parsed: unknown = JSON.parse(rawTypedData)
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('eth_signTypedData_v4: expected typed data payload to be an object')
        }
        const typed = parsed as { types?: Record<string, unknown> }
        const { EIP712Domain: _domain, ...types } = typed.types ?? {}
        return account.signTypedData({ ...typed, types } as Parameters<typeof account.signTypedData>[0])
      }
      case 'eth_sendTransaction': {
        throw new Error('eth_sendTransaction must be mocked!', { cause: params })
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

async function forward(method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch('https://rpc-request-from.wallet', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json: unknown = await res.json()
  if (typeof json !== 'object' || json === null) {
    throw new Error(`Unexpected RPC response for ${method}: expected a JSON object`)
  }
  if ('error' in json && json.error != null) {
    const err = json.error as { code?: unknown; message?: unknown }
    throw {
      code: typeof err.code === 'number' ? err.code : -32000,
      message: typeof err.message === 'string' ? err.message : 'RPC error',
    }
  }
  return 'result' in json ? (json as { result?: unknown }).result : undefined
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
