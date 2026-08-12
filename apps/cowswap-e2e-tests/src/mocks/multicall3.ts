import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { AGGREGATE3_SELECTOR, ALLOWANCE_SELECTOR, encodeAllowanceResult, type AllowanceCall } from './allowances/codec'
import { normalizeRpcUrl, resolveRpcChainIds } from './allowances/rpcUrls'

import { CHAIN_IDS } from '../support/constants'

import type { AllowancesMock } from './allowances'
import type { BrowserContext, Route } from '@playwright/test'

/** Canonical Multicall3 deployment address — identical on every EVM chain. */
const MULTICALL3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11'
/** `getEthBalance(address)` on Multicall3 itself. */
const GET_ETH_BALANCE_SELECTOR = '0x4d2301cc'
/** ERC20 `balanceOf(address)`. */
const BALANCE_OF_SELECTOR = '0x70a08231'

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

const ADDRESS_PAIR = [{ type: 'address' }, { type: 'address' }] as const
const UINT256 = [{ type: 'uint256' }] as const
const ZERO_UINT256 = encodeAbiParameters(UINT256, [0n])

interface BatchCall {
  kind: 'batch'
  calls: ClassifiedCall[]
}
type ClassifiedCall = AllowanceCall | BatchCall | OpaqueCall | UnknownCall | ZeroCall
interface JsonRpcEntry {
  id: number | string
  method: string
  params?: [{ to?: string; data?: string }, ...unknown[]]
}
interface OpaqueCall {
  kind: 'opaque'
}
interface ResultSlot {
  success: boolean
  returnData: Hex
}
interface UnknownCall {
  kind: 'unknown'
}

interface ZeroCall {
  kind: 'zero'
}

const OPAQUE: OpaqueCall = { kind: 'opaque' }
const UNKNOWN: UnknownCall = { kind: 'unknown' }
const ZERO: ZeroCall = { kind: 'zero' }

/**
 * Host-agnostic fallback for Multicall3's `aggregate3` — the single biggest source of real,
 * rate-limited RPC traffic seen in `logUnmockedRpcRequests`' output (`LOG_UNMOCKED_RPC=1`): 87 of
 * ~143 unmocked lines in one traced run, 22 of them real `429`s. The app's independent read-only
 * RPC client (see `mockSocketVerifier.ts`'s doc comment, and the cross-chain-swaps `AGENTS.md`
 * note on it) doesn't reliably use the wallet's own `REACT_APP_NETWORK_URL_<chainId>` endpoint, so
 * `mocks/allowances`'s URL-scoped handler misses any batch that lands on a different real host
 * (Infura, the WalletConnect RPC relay, publicnode, ...). `mockSocketVerifier` is host-agnostic but
 * only installed for Bungee-provider cross-chain tests, and only resolves its own SocketVerifier
 * selectors — everything else inside the batch still falls through to a real (if now safely
 * try/caught) `route.fetch()`.
 *
 * This mock closes that gap generally: it engages for *any* `eth_call` whose decoded body is (or
 * contains, once batches are unwrapped) an `aggregate3` call to the canonical Multicall3 address,
 * *except* on a host `mocks/allowances` already owns (any `REACT_APP_NETWORK_URL_<chainId>`
 * override) — those defer immediately via `route.fallback()`, since `mocks/allowances`'s
 * URL-scoped handler already knows the exact chain id for that host and resolves allowances
 * correctly; this mock's own `chainIdFromUrl` is a heuristic (see its doc comment) that guesses
 * mainnet absent better information, and guessing wrong for a *configured* host — e.g. Sepolia's
 * `ethereum-sepolia-rpc.publicnode.com` — silently resolved a seeded allowance against the wrong
 * chain key and made it read back as unconfigured (0), breaking `[LO-01]` and any other
 * Sepolia-based test relying on `mocks.allowances.set(...)`. So this mock only ever engages for
 * hosts *not* in that map — the genuinely unpredictable ones (Infura, the WalletConnect RPC relay,
 * publicnode-for-a-different-chain, ...) `mocks/allowances` was never scoped to reach — and fully
 * resolves those locally. Anything it doesn't own inside the batch (including SocketVerifier's own
 * selectors, when `mockSocketVerifier` isn't active) gets a safe empty success slot instead of a
 * real network round-trip.
 */
export function installMulticall3(context: BrowserContext, deps: { allowances: AllowancesMock }): void {
  const configuredChainIdByUrl = resolveRpcChainIds()

  void context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()
    if (isConfiguredHost(request.url(), configuredChainIdByUrl)) return route.fallback()

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
      return classifyTopLevel(call.to, call.data)
    })

    if (classified.every((call) => call.kind === 'opaque')) return route.fallback()

    const chainId = chainIdFromUrl(request.url())

    if (classified.every((call) => call.kind === 'batch')) {
      const payload = entries.map((entry, index) => ({
        jsonrpc: '2.0',
        id: entry.id,
        result: encodeBatchResult(classified[index] as BatchCall, chainId, deps.allowances),
      }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
      })
    }

    return fulfillFromUpstream(route, entries, classified, chainId, deps.allowances)
  })
}

/**
 * Best-effort chain id for a host-agnostic request that's *not* on a configured host (those defer
 * entirely, see `isConfiguredHost`) — there's no `REACT_APP_NETWORK_URL_<chainId>` -> chain id
 * mapping for an unpredictable host by definition, so this looks for the `chainId=eip155:<id>`
 * query param WalletConnect's RPC relay puts on its URLs (e.g.
 * `rpc.walletconnect.org/v1/?chainId=eip155%3A1&...`), then falls back to mainnet. This is a
 * heuristic based on what `logUnmockedRpcRequests` has actually observed (every logged
 * `aggregate3` occurrence on an unconfigured host so far has been mainnet), not a general solution
 * — a non-mainnet occurrence would resolve allowances against the wrong chain and needs a real fix
 * (threading the chain id through some other signal) rather than another special case here.
 */
function chainIdFromUrl(rawUrl: string): number {
  try {
    const raw = new URL(rawUrl).searchParams.get('chainId')
    const match = raw ? /^eip155:(\d+)$/.exec(raw) : null
    if (match) return Number(match[1])
  } catch {
    // Malformed URL — fall through to the mainnet default below.
  }
  return CHAIN_IDS.MAINNET
}

/**
 * Classifies one inner call by selector alone (not `to`) — same rationale as
 * `allowances/codec.ts`'s `classifyCall`: calldata that decodes as `aggregate3` is a nested batch
 * whatever it's addressed to, and unrecognized selectors default to `unknown` rather than
 * `opaque`, since (unlike the top-level entry) this is always resolved locally once the outer
 * `aggregate3` shape has been recognized.
 */
function classifyInner(to: string, data: string): ClassifiedCall {
  const selector = data.slice(0, 10).toLowerCase()

  if (selector === ALLOWANCE_SELECTOR) return decodeAllowance(to, data)
  if (selector === GET_ETH_BALANCE_SELECTOR || selector === BALANCE_OF_SELECTOR) return ZERO
  if (selector === AGGREGATE3_SELECTOR) return decodeBatch(data, classifyInner)
  return UNKNOWN
}

/** Classifies the top-level `eth_call` — only an `aggregate3` call to Multicall3 itself engages this mock. */
function classifyTopLevel(to: string, data: string): ClassifiedCall {
  const selector = data.slice(0, 10).toLowerCase()
  if (!areAddressesEqual(to, MULTICALL3_ADDRESS) || selector !== AGGREGATE3_SELECTOR) return OPAQUE
  return decodeBatch(data, classifyInner)
}

/** Mirrors `allowances/codec.ts`'s `classifyAllowance` decode step, normalizing via the same `getAddressKey`. */
function decodeAllowance(to: string, data: string): ClassifiedCall {
  try {
    const [owner, spender] = decodeAbiParameters(ADDRESS_PAIR, `0x${data.slice(10)}` as Hex)
    return { kind: 'allowance', token: getAddressKey(to), owner: getAddressKey(owner), spender: getAddressKey(spender) }
  } catch {
    return UNKNOWN
  }
}

/** Decodes an `aggregate3` payload into its inner calls, recursing for nested batches. */
function decodeBatch(data: string, classify: (to: string, data: string) => ClassifiedCall): ClassifiedCall {
  try {
    const [calls] = decodeAbiParameters(CALL3_TUPLE, `0x${data.slice(10)}` as Hex)
    return {
      kind: 'batch',
      calls: (calls as ReadonlyArray<{ target: string; callData: Hex }>).map((c) => classify(c.target, c.callData)),
    }
  } catch {
    return OPAQUE
  }
}

function encodeBatchResult(call: BatchCall, chainId: number, allowances: AllowancesMock): Hex {
  const slots: ResultSlot[] = call.calls.map((inner) => resolveSlot(inner, chainId, allowances))
  return encodeAbiParameters(RESULT_TUPLE, [slots])
}

/**
 * A mixed batch alongside something this mock doesn't recognize as `aggregate3`-to-Multicall3 (rare
 * — the log evidence shows this almost always arrives as a single `eth_call`) — same defensive
 * try/catch as every other host-agnostic mock in this suite (`mockSocketVerifier`,
 * `installEthBlockNumber`, `installEthGetCode`), patching only the recognized slots and forwarding
 * the rest of the real response untouched.
 */
async function fulfillFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  classified: ClassifiedCall[],
  chainId: number,
  allowances: AllowancesMock,
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]

    const classifiedById = new Map<number | string, ClassifiedCall>()
    entries.forEach((entry, index) => classifiedById.set(entry.id, classified[index]))

    const payload = upstreamEntries.map((entry) => {
      const call = classifiedById.get(entry.id)
      if (!call || call.kind !== 'batch') return entry
      return { jsonrpc: '2.0', id: entry.id, result: encodeBatchResult(call, chainId, allowances) }
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

/** Whether `rawUrl` is one of `mocks/allowances`'s own `REACT_APP_NETWORK_URL_<chainId>`-configured
 * hosts — if so, this mock must not answer at all; see `installMulticall3`'s doc comment. */
function isConfiguredHost(rawUrl: string, configuredChainIdByUrl: Map<string, number>): boolean {
  try {
    return configuredChainIdByUrl.has(normalizeRpcUrl(rawUrl))
  } catch {
    return false
  }
}

/**
 * Resolves one decoded inner call to its Multicall3 result slot.
 *
 * - `allowance` reads through `deps.allowances`'s live fixture/override state, so
 *   `mocks.allowances.set(...)` is honored no matter which real host answered the batch.
 * - `zero` (Multicall3's own `getEthBalance` and ERC20 `balanceOf`) always returns `0`: balances in
 *   this suite are tracked via the balances-watcher SSE mock (`mocks/balances`), not via RPC reads,
 *   so there's no existing mocked state to reuse here, and these Multicall3 reads are typically for
 *   auxiliary/throwaway addresses (e.g. a bridging deposit address), not the tracked test wallet. A
 *   `set()`-style override could be added later if a specific test needs a non-zero value.
 * - `batch` recurses; `unknown`/`opaque` get a safe empty success slot rather than ever triggering a
 *   real `route.fetch()` — the core fix this mock exists for.
 */
function resolveSlot(call: ClassifiedCall, chainId: number, allowances: AllowancesMock): ResultSlot {
  if (call.kind === 'allowance') {
    return { success: true, returnData: encodeAllowanceResult(allowances.resolve(chainId, call)) }
  }
  if (call.kind === 'zero') {
    return { success: true, returnData: ZERO_UINT256 }
  }
  if (call.kind === 'batch') {
    return { success: true, returnData: encodeBatchResult(call, chainId, allowances) }
  }
  return { success: true, returnData: '0x' }
}
