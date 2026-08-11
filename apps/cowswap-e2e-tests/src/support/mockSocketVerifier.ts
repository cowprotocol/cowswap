import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

import { AGGREGATE3_SELECTOR } from '../mocks/allowances/codec'

import type { BrowserContext, Route } from '@playwright/test'

const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
// `validateRotueId(bytes,uint32)` / `validateSocketRequest(bytes,(uint32,(uint256,address,uint256,address,bytes4)))`
// — both `nonpayable` with no outputs, called via `eth_call`; the SDK only checks the call
// doesn't revert (see `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`).
const STUBBED_SELECTORS = new Set(['0xeee54b0d', '0xf75d4a35'])

const CALL3_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'target', type: 'address' },
      { name: 'allowFailure', type: 'bool' },
      { name: 'callData', type: 'bytes' },
    ],
  },
] as const

const RESULT_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' },
    ],
  },
] as const

interface BatchCall {
  kind: 'batch'
  calls: ClassifiedCall[]
}
interface BatchResultSlot {
  success: boolean
  returnData: Hex
}
type ClassifiedCall = StubbedCall | BatchCall | OpaqueCall
interface JsonRpcEntry {
  id: number | string
  method: string
  params?: [{ to?: string; data?: string }, ...unknown[]]
  result?: unknown
}

interface OpaqueCall {
  kind: 'opaque'
}

interface StubbedCall {
  kind: 'stubbed'
}

const OPAQUE: OpaqueCall = { kind: 'opaque' }

/**
 * `BungeeBridgeProvider.getQuote()` verifies the build-tx it gets from Bungee's API by reading
 * two functions on the on-chain SocketVerifier contract, on the origin chain — Near Intents never
 * does this. This suite's own RPC proxy (`fixtures/rpcProxy.ts`) only sits in front of the
 * *wallet's* provider requests; this contract read instead goes through the app's independent
 * read-only RPC client (`RPC_URLS` in `libs/common-const/src/networks.ts`), which for any chain
 * without a `REACT_APP_NETWORK_URL_<chainId>` override (every chain here except Sepolia) falls
 * back to a real public endpoint (a baked-in Infura key, confirmed by tracing real traffic) — so
 * this needs a host-agnostic route rather than `rpcProxy.stubCall`. Without it, the real call
 * reverts with `RouteIdNotFound()` and every Bungee quote fetch fails with `TX_BUILD_ERROR`.
 */
export function mockSocketVerifier(context: BrowserContext): void {
  void context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()

    let body: JsonRpcEntry | JsonRpcEntry[]
    try {
      body = JSON.parse(request.postData() ?? '') as JsonRpcEntry | JsonRpcEntry[]
    } catch {
      return route.fallback()
    }

    const entries = Array.isArray(body) ? body : [body]
    const classified = entries.map((entry) => {
      if (entry.method !== 'eth_call') return OPAQUE
      const call = entry.params?.[0]
      if (!call?.to || !call?.data) return OPAQUE
      return classifyCall(call.to, call.data)
    })

    if (classified.every((c) => c.kind === 'opaque')) return route.fallback()

    if (classified.every(isFullyMocked)) {
      const payload = entries.map((entry, i) => ({ jsonrpc: '2.0', id: entry.id, result: buildResult(classified[i]) }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
      })
    }

    // Some entries need real data (fully opaque, or a batch only partially recognized) — fetch
    // upstream and patch in only what's actually mocked, same merge technique as the allowances mock.
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]

    const classifiedById = new Map<number | string, ClassifiedCall>()
    entries.forEach((entry, i) => classifiedById.set(entry.id, classified[i]))

    const payload = upstreamEntries.map((entry) => {
      const classifiedEntry = classifiedById.get(entry.id)
      if (!classifiedEntry || classifiedEntry.kind === 'opaque') return entry
      const upstreamResult = typeof entry.result === 'string' ? (entry.result as Hex) : undefined
      return { jsonrpc: '2.0', id: entry.id, result: buildResult(classifiedEntry, upstreamResult) }
    })
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(Array.isArray(upstreamBody) ? payload : payload[0]),
    })
  })
}

function buildResult(call: ClassifiedCall, upstream?: Hex): unknown {
  if (call.kind === 'stubbed') return '0x'
  if (call.kind === 'opaque') return undefined
  return resolveBatchResult(call, upstream)
}

/**
 * Classifies one `eth_call` payload, recursively — mirrors `mocks/allowances/codec.ts`'s
 * `classifyCall`, since Multicall3 batches nest the same way regardless of what's inside them.
 * The app never calls the SocketVerifier directly: tracing real RPC traffic shows it's always
 * bundled into a Multicall3 `aggregate3` batch alongside unrelated ERC20/allowance reads, so
 * recognizing the target wherever it appears inside a batch (rather than requiring the *whole*
 * batch to be nothing else) is what keeps this from having to understand every other call in it.
 */
function classifyCall(to: string, data: string): ClassifiedCall {
  const selector = data.slice(0, 10).toLowerCase()

  if (to.toLowerCase() === SOCKET_VERIFIER_ADDRESS && STUBBED_SELECTORS.has(selector)) {
    return { kind: 'stubbed' }
  }
  if (selector === AGGREGATE3_SELECTOR) {
    try {
      const [calls] = decodeAbiParameters(CALL3_TUPLE, `0x${data.slice(10)}` as Hex)
      return {
        kind: 'batch',
        calls: (calls as ReadonlyArray<{ target: string; callData: Hex }>).map((c) =>
          classifyCall(c.target, c.callData),
        ),
      }
    } catch {
      return OPAQUE
    }
  }
  return OPAQUE
}

function decodeResultSlots(blob: Hex): BatchResultSlot[] {
  try {
    return [...(decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<BatchResultSlot>)]
  } catch {
    return []
  }
}

function isFullyMocked(call: ClassifiedCall): boolean {
  if (call.kind === 'stubbed') return true
  if (call.kind === 'opaque') return false
  return call.calls.every(isFullyMocked)
}

/** Same upstream-as-base patch technique as `codec.ts`'s `resolveBatchResult`. */
function resolveBatchResult(call: BatchCall, upstream?: Hex): Hex {
  const base = upstream ? decodeResultSlots(upstream) : []

  const slots = call.calls.map((inner, index) => {
    const fallback = base[index] ?? { success: false, returnData: '0x' as Hex }

    if (inner.kind === 'stubbed') return { success: true, returnData: '0x' as Hex }
    if (inner.kind === 'batch') {
      const nestedUpstream = fallback.success ? fallback.returnData : undefined
      return { success: true, returnData: resolveBatchResult(inner, nestedUpstream) }
    }
    return fallback
  })

  return encodeAbiParameters(RESULT_TUPLE, [slots])
}
