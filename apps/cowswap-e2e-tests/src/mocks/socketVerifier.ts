import { decodeAbiParameters, encodeAbiParameters, type Hex, toFunctionSelector } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import type { BrowserContext, Route } from '@playwright/test'

const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
// Both `nonpayable` with no outputs, called via `eth_call`; the SDK only checks the call doesn't
// revert (see `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`). Derived from the real
// signatures (note the SDK's own typo: `validateRotueId`, not `validateRouteId`) rather than
// hardcoded hex, so a signature change in the SDK surfaces as a diff here instead of silently
// going stale.
const STUBBED_SELECTORS = [
  toFunctionSelector('validateRotueId(bytes,uint32)'),
  toFunctionSelector('validateSocketRequest(bytes,(uint32,(uint256,address,uint256,address,bytes4)))'),
]

/** `aggregate3((address,bool,bytes)[])` on Multicall3 — the same selector `mocks/multicall3.ts`
 * and `mocks/allowances/codec.ts` each derive independently; duplicated here too rather than
 * imported so this mock stays a standalone, dependency-free unit like `ethBlockNumber.ts`. */
const AGGREGATE3_SELECTOR = '0x82ad56cb'

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

export interface BatchCall {
  kind: 'batch'
  calls: ClassifiedCall[]
}

export type ClassifiedCall = BatchCall | OpaqueCall | StubbedCall

export interface OpaqueCall {
  kind: 'opaque'
}

export interface StubbedCall {
  kind: 'stubbed'
}

interface JsonRpcEntry {
  id: number | string
  method: string
  params?: [{ to?: string; data?: string }, ...unknown[]]
  result?: unknown
}

interface ResultSlot {
  success: boolean
  returnData: Hex
}

const OPAQUE: OpaqueCall = { kind: 'opaque' }
const STUBBED: StubbedCall = { kind: 'stubbed' }

/**
 * Classifies one `eth_call` by its calldata: a match on `SOCKET_VERIFIER_ADDRESS` and one of
 * `STUBBED_SELECTORS`, an `aggregate3` batch (recursed regardless of `to` — same rationale as
 * `allowances/codec.ts`'s `classifyCall`: calldata that decodes as `aggregate3` is a batch
 * whatever it's addressed to), or opaque.
 */
export function classifyCall(to: string, data: string): ClassifiedCall {
  const selector = data.slice(0, 10).toLowerCase()
  if (areAddressesEqual(to, SOCKET_VERIFIER_ADDRESS) && STUBBED_SELECTORS.includes(selector as Hex)) return STUBBED
  if (selector === AGGREGATE3_SELECTOR) return decodeBatch(data)
  return OPAQUE
}

/** Encodes the result for a call already known to be fully stubbed (`isFullyStubbed` true) — a
 * bare stub resolves to empty `returnData` (both stubbed functions are `nonpayable` with no
 * outputs; the SDK only checks the call doesn't revert), a batch nests one such result per child,
 * all `success: true`. */
export function encodeResult(call: ClassifiedCall): Hex {
  if (call.kind !== 'batch') return '0x'
  const slots: ResultSlot[] = call.calls.map((inner) => ({ success: true, returnData: encodeResult(inner) }))
  return encodeAbiParameters(RESULT_TUPLE, [slots])
}

/**
 * Bungee's on-chain SocketVerifier check (`validateRotueId`/`validateSocketRequest`,
 * `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`). The app's own independent read-only
 * client can issue this as a real page-level `eth_call`, batched inside a Multicall3
 * `aggregate3`, on whatever real RPC host it picks for the connected chain — e.g.
 * `https://ethereum-rpc.publicnode.com` for Mainnet, the same host `REACT_APP_NETWORK_URL_1`
 * configures. Neither `mocks/allowances` (which owns that configured host) nor
 * `mocks/multicall3.ts` (which deliberately defers on any host `mocks/allowances` owns) has any
 * notion of these selectors, so without this mock the call forwards untouched to the real host —
 * a real, rate-limited dependency, same class of gap `installMulticall3`'s own doc comment
 * describes for unrecognized Multicall3 traffic in general. See `AGENTS.md`'s cross-chain
 * bridging section for this check's history — it also used to reach the network through the
 * connected wallet's own provider, a case this mock's page-network-layer `context.route()` can't
 * see at all, stubbed separately at the time; that stub was later deleted once this mock alone
 * proved sufficient.
 *
 * Host-agnostic and registered ahead of `installMulticall3`/`installAllowances` in the `mocks`
 * fixture (last registered wins in Playwright's LIFO route order), so it always gets first look:
 * it resolves any matching call locally — never touching the network — and falls back untouched
 * otherwise, the same shape as `ethBlockNumber.ts`/`ethGetCode.ts`.
 */
export function installSocketVerifier(context: BrowserContext): void {
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

    if (classified.every((call) => call.kind === 'opaque')) return route.fallback()

    if (classified.every(isFullyStubbed)) {
      const payload = entries.map((entry, index) => ({
        jsonrpc: '2.0',
        id: entry.id,
        result: encodeResult(classified[index]),
      }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
      })
    }

    return fulfillFromUpstream(route, entries, classified)
  })
}

export function isFullyStubbed(call: ClassifiedCall): boolean {
  if (call.kind === 'stubbed') return true
  if (call.kind === 'opaque') return false
  return call.calls.every(isFullyStubbed)
}

function decodeBatch(data: string): ClassifiedCall {
  try {
    const [calls] = decodeAbiParameters(CALL3_TUPLE, `0x${data.slice(10)}` as Hex)
    return {
      kind: 'batch',
      calls: (calls as ReadonlyArray<{ target: string; callData: Hex }>).map((c) => classifyCall(c.target, c.callData)),
    }
  } catch {
    return OPAQUE
  }
}

function decodeResultSlots(blob: Hex): ResultSlot[] {
  try {
    return [...(decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<ResultSlot>)]
  } catch {
    // An upstream error body or a truncated blob must not lose the stubbed slots.
    return []
  }
}

/**
 * A mixed batch alongside something this mock doesn't own (rare — the real capture this mock is
 * modeled on arrived as a single, unbatched SocketVerifier call) — same defensive try/catch as
 * every other host-agnostic mock in this suite (`installMulticall3`, `installEthBlockNumber`),
 * patching only the recognized slots and forwarding the rest of the real response untouched.
 */
async function fulfillFromUpstream(route: Route, entries: JsonRpcEntry[], classified: ClassifiedCall[]): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]

    const classifiedById = new Map<number | string, ClassifiedCall>()
    entries.forEach((entry, index) => classifiedById.set(entry.id, classified[index]))

    const payload = upstreamEntries.map((entry) => {
      const id = (entry as JsonRpcEntry).id
      const call = classifiedById.get(id)
      if (!call || call.kind === 'opaque') return entry

      const upstreamResult = typeof entry.result === 'string' ? (entry.result as Hex) : undefined
      return { jsonrpc: '2.0', id, result: patchResult(call, upstreamResult) }
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

/** Like `encodeResult`, but for a call that may be only partially stubbed: an unmocked slot keeps
 * whatever the real upstream returned for that position instead of a safe empty success — this
 * mock only ever answers for the exact calls it recognizes. */
function patchResult(call: ClassifiedCall, upstream?: Hex): Hex {
  if (call.kind !== 'batch') return '0x'

  const base = upstream ? decodeResultSlots(upstream) : []
  const slots = call.calls.map((inner, index) => {
    const fallback = base[index] ?? { success: false, returnData: '0x' as Hex }
    if (inner.kind === 'opaque') return fallback
    const nestedUpstream = inner.kind === 'batch' && fallback.success ? fallback.returnData : undefined
    return { success: true, returnData: patchResult(inner, nestedUpstream) }
  })

  return encodeAbiParameters(RESULT_TUPLE, [slots])
}
