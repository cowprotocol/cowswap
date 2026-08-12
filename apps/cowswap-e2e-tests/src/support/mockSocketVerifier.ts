import { decodeAbiParameters, encodeAbiParameters, toFunctionSelector, type Hex } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { AGGREGATE3_SELECTOR } from '../mocks/allowances/codec'

import type { BrowserContext, Route } from '@playwright/test'

const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
// Both `nonpayable` with no outputs, called via `eth_call`; the SDK only checks the call doesn't
// revert (see `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`). Derived from the real
// signatures (note the SDK's own typo: `validateRotueId`, not `validateRouteId`) rather than
// hardcoded hex, so a signature change in the SDK surfaces as a diff here instead of silently
// going stale.
const STUBBED_SELECTORS = new Set<string>([
  toFunctionSelector('validateRotueId(bytes,uint32)'),
  toFunctionSelector('validateSocketRequest(bytes,(uint32,(uint256,address,uint256,address,bytes4)))'),
])

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
export async function mockSocketVerifier(context: BrowserContext): Promise<void> {
  await context.route('**/*', async (route: Route) => {
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

    return fulfillFromUpstream(route, entries, classified)
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

  if (areAddressesEqual(to, SOCKET_VERIFIER_ADDRESS) && STUBBED_SELECTORS.has(selector)) {
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

/**
 * Some entries need real data (fully opaque, or a batch only partially recognized) — fetch
 * upstream and patch in only what's actually mocked, same merge technique as the allowances mock.
 * This is *always* the path taken here (the SocketVerifier call is never alone in its batch, see
 * `classifyCall`'s doc comment), so every Bungee test's quote fetch depends on this real
 * round-trip to whatever real RPC the app used — reliable for one test at a time, but a real,
 * unmocked network dependency that can time out under `pnpm e2e`'s full parallel load (many
 * workers hitting the same public endpoint at once). Mirror the allowances mock's own try/catch
 * here: on failure, fall back instead of letting the rejection abort the request outright — the
 * allowances mock (registered earlier) still gets a chance to answer the allowance slots, and a
 * transient real-RPC hiccup no longer takes the whole quote down with it.
 */
async function fulfillFromUpstream(route: Route, entries: JsonRpcEntry[], classified: ClassifiedCall[]): Promise<void> {
  try {
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
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(Array.isArray(upstreamBody) ? payload : payload[0]),
    })
  } catch {
    await route.fallback()
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
