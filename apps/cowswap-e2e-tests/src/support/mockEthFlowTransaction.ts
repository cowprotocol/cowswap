import { decodeAbiParameters, encodeAbiParameters, type Address, type Hex } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { mockRpcNodeRequest } from './mockRpcNodeRequest'
import { resolveNestedCall } from './nestedRpcCallRegistry'

import type { JsonRpcEntry } from './mockRpcNodeRequest'
import type { MockWalletApi } from '../fixtures/mockWallet'
import type { RpcStub } from '../mockWallet/walletEngine'
import type { BrowserContext } from '@playwright/test'

const FAKE_ETH_FLOW_TX_HASH = `0x${'ef'.repeat(32)}` as const

/** `getEthBalance(address)` on Multicall3 — how this app actually reads native ETH balance (confirmed by tracing real RPC traffic; it is never a bare `eth_getBalance`). */
const GET_ETH_BALANCE_SELECTOR = '0x4d2301cc'
/** `aggregate3((address,bool,bytes)[])` on Multicall3 — same batching every other read on this RPC channel goes through, see `mocks/allowances/codec.ts`. */
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

const UINT256 = [{ type: 'uint256' }] as const

export interface BatchCall {
  kind: 'batch'
  calls: ClassifiedEthCall[]
}

export type ClassifiedEthCall = OwnBalanceCall | BatchCall | OpaqueCall

export interface NativeBalanceRouteOpts {
  context: BrowserContext
  /** Owner whose `getEthBalance(owner)` reads (however deep inside a Multicall3 batch) get patched. */
  owner: string
  /** The fake hash `eth_getTransactionReceipt` polls for. */
  txHash: Hex
  /** Read fresh each time the route fires, so it reflects whatever the caller's own `eth_sendTransaction` stub last recorded. */
  getBalance: () => bigint
  /** Whether the receipt should report success yet — the caller owns this flag so it can also
   * drive its own `confirmMined()`/other routes (e.g. `mockEthFlowTxLookupFallback`) in step. */
  isMined: () => boolean
}

/** Anything this route doesn't itself recognize — carries its own `target`/`callData` so
 * `resolveEthBalanceBatch` can still ask `nestedRpcCallRegistry.ts` whether some *other*,
 * unrelated mock (e.g. `installSocketVerifier`) recognizes it before ever trusting whatever a real
 * upstream fetch said for it. */
export interface OpaqueCall {
  kind: 'opaque'
  target: Address
  callData: Hex
}

export interface OwnBalanceCall {
  kind: 'ownBalance'
}

interface BatchResultSlot {
  success: boolean
  returnData: Hex
}

/**
 * Classifies one `eth_call` payload for `owner`'s own ETH balance, recursively — mirrors
 * `mocks/allowances/codec.ts`'s `classifyCall`, since Multicall3 batches nest the same way
 * regardless of what's inside them. Recognizing `getEthBalance(owner)` wherever it appears inside
 * a batch (rather than requiring the *whole* batch to be nothing but that) is what keeps this from
 * ever needing to forward the owner's real balance to the real RPC just because some other,
 * unrelated read got bundled into the same Multicall3 call. `target` is the call's own `to` (the
 * top-level entry's `to` for a bare call, or each inner call's own `target` when nested in an
 * `aggregate3` batch) — carried on an unrecognized (`opaque`) call so `resolveEthBalanceBatch` can
 * still ask around for it later, see `OpaqueCall`'s doc comment.
 */
export function classifyEthCall(data: Hex, owner: string, target: string): ClassifiedEthCall {
  const selector = data.slice(0, 10).toLowerCase()

  if (selector === GET_ETH_BALANCE_SELECTOR) {
    try {
      const [address] = decodeAbiParameters([{ type: 'address' }], `0x${data.slice(10)}` as Hex)
      return areAddressesEqual(address as string, owner) ? { kind: 'ownBalance' } : opaque(target, data)
    } catch {
      return opaque(target, data)
    }
  }

  if (selector === AGGREGATE3_SELECTOR) {
    try {
      const [calls] = decodeAbiParameters(CALL3_TUPLE, `0x${data.slice(10)}` as Hex)
      return {
        kind: 'batch',
        calls: (calls as ReadonlyArray<{ target: string; callData: Hex }>).map((c) =>
          classifyEthCall(c.callData, owner, c.target),
        ),
      }
    } catch {
      return opaque(target, data)
    }
  }

  return opaque(target, data)
}

/**
 * Shared by every mock that fakes a plain `eth_sendTransaction` and needs to patch the two
 * direct-RPC reads the app polls afterwards: the tx's own `eth_getTransactionReceipt`, and the
 * wallet's native ETH balance (read via Multicall3's `getEthBalance`, batched through `aggregate3`
 * — see `classifyEthCall`). Used by `mockEthFlowTransaction`, `mockWrapTransaction`, and
 * `mockUnwrapTransaction` — the only things that differ between them are the fake tx hash and the
 * direction/amount `getBalance()` computes. The receipt reports success only once `isMined()` says
 * so, so a test can assert the transient "pending" state before letting it proceed.
 *
 * Built on `mockRpcNodeRequest` (the same match/resolve/fallback-to-upstream-merge engine
 * `mockContractViewCall` uses) rather than hand-rolling that plumbing again: `matches()` decides
 * whether an entry is ours at all, and `resolve()` either answers it outright or — for a batch
 * only partially recognized (some `getEthBalance` calls, some unrelated reads) — returns
 * `undefined` on the first pass so `mockRpcNodeRequest` fetches the real upstream and calls
 * `resolve()` again with it, this time patching only the recognized slots.
 *
 * Registered host-agnostically (no `rpcUrl` scoping): the app's own real-RPC traffic for a given
 * chain doesn't reliably go through `REACT_APP_NETWORK_URL_<chainId>` — see AGENTS.md — so matching
 * by the actual JSON-RPC method/calldata (`classifyEthCall`, the tracked `txHash`) is what's
 * reliable, not the host it happens to land on.
 */
export function installNativeBalanceRoute(opts: NativeBalanceRouteOpts): void {
  const { context, owner, txHash, getBalance, isMined } = opts

  const classifyCall = (entry: JsonRpcEntry): ClassifiedEthCall | undefined => {
    if (entry.method !== 'eth_call') return undefined
    const call = entry.params[0] as { to?: string; data?: Hex } | undefined
    return call?.data ? classifyEthCall(call.data, owner, call.to ?? '') : undefined
  }

  // A batch's own `kind` is `'batch'` even when every call inside it is opaque (e.g. an aggregate3
  // wrapping nothing but an unrelated on-chain check, like SocketVerifier's `validateRotueId`) —
  // `isFullyOpaqueCall` (rather than a shallow `kind !== 'opaque'` check) is what keeps that shape
  // correctly unrecognized, so it falls back to `route.fallback()` and an earlier-registered, more
  // specific mock (e.g. `installSocketVerifier`) gets a chance to answer it instead of this route
  // sending it to `route.fetch()` and relaying a real revert.
  const matches = (entry: JsonRpcEntry): boolean => {
    if (entry.method === 'eth_getTransactionReceipt') return entry.params[0] === txHash
    const call = classifyCall(entry)
    return call !== undefined && !isFullyOpaqueCall(call)
  }

  const resolve = (entry: JsonRpcEntry, upstreamResult?: unknown): unknown => {
    if (entry.method === 'eth_getTransactionReceipt') {
      return entry.params[0] === txHash ? (isMined() ? buildReceipt(txHash) : null) : undefined
    }

    const call = classifyCall(entry)
    if (!call || call.kind === 'opaque') return undefined
    if (call.kind === 'ownBalance') return encodeAbiParameters(UINT256, [getBalance()])

    // `call.kind === 'batch'`: answerable locally only once every leaf is `ownBalance` or
    // something a *different*, unrelated mock recognizes (`nestedRpcCallRegistry.ts`) — otherwise
    // the remaining slots need the real upstream blob as their base.
    if (isFullyMocked(context, call)) return resolveEthBalanceBatch(context, call, getBalance())
    if (typeof upstreamResult !== 'string') return undefined
    return resolveEthBalanceBatch(context, call, getBalance(), upstreamResult as Hex)
  }

  mockRpcNodeRequest(context, ['eth_call', 'eth_getTransactionReceipt'], resolve, matches)
}

/** True once every leaf in `call` is something answerable without ever touching the real upstream:
 * the caller's own balance, or a call some *other*, unrelated mock recognizes (e.g.
 * `installSocketVerifier`'s own selectors, via `nestedRpcCallRegistry.ts`) — batched alongside a
 * genuine `ownBalance` call purely by viem's own incidental request batching. */
export function isFullyMocked(context: BrowserContext, call: ClassifiedEthCall): boolean {
  if (call.kind === 'ownBalance') return true
  if (call.kind === 'opaque') return typeof resolveNestedCall(context, call.target, call.callData) !== 'undefined'
  return call.calls.every((inner) => isFullyMocked(context, inner))
}

/** True when `call` recognizes no `ownBalance` leaf anywhere — including a batch whose every call
 * is itself opaque (e.g. nothing but SocketVerifier checks). Deliberately does *not* consult
 * `nestedRpcCallRegistry.ts`: a batch with no `ownBalance` concern of this route's own is none of
 * its business at all, so it should defer the whole thing (`route.fallback()`) rather than answer
 * it itself just because it happens to be *able* to, via some other mock's registered resolver. */
export function isFullyOpaqueCall(call: ClassifiedEthCall): boolean {
  if (call.kind === 'ownBalance') return false
  if (call.kind === 'opaque') return true
  return call.calls.every(isFullyOpaqueCall)
}

/**
 * Builds the `Result[]` blob for a batch, patching the `ownBalance` slots, asking around
 * (`nestedRpcCallRegistry.ts`) for any other slot before ever trusting the real upstream response
 * for it, and only actually falling back to that real response — or a failure slot if there's no
 * upstream at all — once nothing recognizes a slot. Same upstream-as-base technique as `codec.ts`'s
 * `resolveBatchResult`.
 */
export function resolveEthBalanceBatch(context: BrowserContext, call: BatchCall, balance: bigint, upstream?: Hex): Hex {
  const base = upstream ? decodeResultSlots(upstream) : []

  const slots = call.calls.map((inner, index) => {
    const fallback = base[index] ?? { success: false, returnData: '0x' as Hex }

    if (inner.kind === 'ownBalance') {
      return { success: true, returnData: encodeAbiParameters(UINT256, [balance]) }
    }
    if (inner.kind === 'batch') {
      const nestedUpstream = fallback.success ? fallback.returnData : undefined
      return { success: true, returnData: resolveEthBalanceBatch(context, inner, balance, nestedUpstream) }
    }

    // `inner.kind === 'opaque'`: give any *other*, unrelated mock a chance to answer this exact
    // call before ever relaying whatever the real upstream said for it.
    const nestedAnswer = resolveNestedCall(context, inner.target, inner.callData)
    return typeof nestedAnswer === 'undefined' ? fallback : { success: true, returnData: nestedAnswer as Hex }
  })

  return encodeAbiParameters(RESULT_TUPLE, [slots])
}

function decodeResultSlots(blob: Hex): BatchResultSlot[] {
  try {
    return [...(decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<BatchResultSlot>)]
  } catch {
    // An upstream error body or a truncated blob must not lose the mocked slots.
    return []
  }
}

function opaque(target: string, callData: Hex): OpaqueCall {
  return { kind: 'opaque', target: target as Address, callData }
}

/** `EthFlowOrder.Data` — the struct `createOrder()` takes, per `libs/abis/src/abis/CoWSwapEthFlow.ts`. */
const ETH_FLOW_ORDER_TUPLE = [
  {
    type: 'tuple',
    components: [
      { name: 'buyToken', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'sellAmount', type: 'uint256' },
      { name: 'buyAmount', type: 'uint256' },
      { name: 'appData', type: 'bytes32' },
      { name: 'feeAmount', type: 'uint256' },
      { name: 'validTo', type: 'uint32' },
      { name: 'partiallyFillable', type: 'bool' },
      { name: 'quoteId', type: 'int64' },
    ],
  },
] as const

export interface EthFlowOrderParams {
  buyToken: string
  receiver: string
  sellAmount: bigint
  buyAmount: bigint
  appData: string
  feeAmount: bigint
  validTo: number
  partiallyFillable: boolean
  quoteId: bigint
}

export interface MockEthFlowTransactionHandle {
  /** The native ETH amount (wei) actually sent in the fake `createOrder()` transaction, once sent. */
  getSentValue(): bigint | undefined
  getTxHash(): string
  /** Marks the creation tx as mined, so `eth_getTransactionReceipt` starts reporting success. */
  confirmMined(): void
  isMined(): boolean
  /** The order struct decoded from the actual `createOrder()` calldata, once the tx is sent — ground
   * truth for building a fulfilled-order response, rather than trusting the UI's rendered figures. */
  getOrderParams(): EthFlowOrderParams | undefined
  /** Marks the order as filled — a caller's own `order`/`orderStatus` overrides read this to decide
   * when to start reporting the trade as settled. */
  confirmFilled(): void
  isFilled(): boolean
}

export interface MockEthFlowTransactionOpts {
  context: BrowserContext
  wallet: Pick<MockWalletApi, 'address' | 'stubRpc'>
  initialEthBalance: bigint
}

/** A generous flat estimate for the `createOrder()` call — never actually spent, since the send itself is stubbed. */
const FAKE_GAS_ESTIMATE = '0x7a120' as const

type TxLookupEntry = { kind: 'receipt' } | { kind: 'transaction' }

/**
 * Fakes the ETH-flow order-creation transaction end-to-end. Selling native ETH doesn't post an
 * off-chain EIP-712-signed order like every other trade in this suite — it sends an on-chain
 * `createOrder()` tx (with the sell amount as `tx.value`) to a dedicated EthFlow contract instead.
 * `eth_sendTransaction` goes through the connected wallet (stubbed here), same channel
 * `mockApproveTransaction` uses for `approve()`. Unlike that helper, there's no allowance to keep
 * in sync — instead this fakes the two direct-RPC reads the app polls afterwards:
 * `eth_getTransactionReceipt` for the creation tx, and the wallet's native ETH balance. The latter
 * never flows through the balances-watcher SSE stream `mocks.balances` intercepts, and — despite
 * `NativeTokenBalanceUpdater`'s own comment claiming a bare `eth_getBalance` — tracing actual RPC
 * traffic shows it's read via Multicall3's `getEthBalance(address)`, batched through `aggregate3`
 * the same way every other read on this RPC channel is (see `mocks/allowances/codec.ts`), so it
 * has to be decoded/patched at that level rather than intercepted as a plain `eth_getBalance`.
 * `classifyEthCall` recognizes the owner's own `getEthBalance` wherever it appears inside a
 * Multicall3 batch — not just when the whole batch is nothing else — so this never has to forward
 * the owner's *real* balance to the real RPC just because some unrelated read got bundled
 * alongside it (which is exactly what let a real Sepolia balance leak into an assertion here once
 * a second ETH-flow test started running against the same wallet address).
 *
 * The receipt (and therefore the order leaving `CREATING`, since `GET /api/v1/orders/{uid}`'s
 * default fixture already answers any uid with a valid open order) is withheld until
 * `confirmMined()` is called, so a test can assert the transient "creating" state before letting
 * it proceed — otherwise both mocks would resolve on the very first poll and race right past it.
 *
 * Both direct-RPC reads below are registered host-agnostically (see `installNativeBalanceRoute`
 * and `mockEthFlowTxLookupFallback`) rather than scoped to `REACT_APP_NETWORK_URL_<chainId>` — the
 * app's own RPC traffic doesn't reliably go through that URL, so there's no `chainId` to key on
 * here in the first place.
 */
export async function mockEthFlowTransaction(opts: MockEthFlowTransactionOpts): Promise<MockEthFlowTransactionHandle> {
  const { context, wallet, initialEthBalance } = opts

  let sentValue: bigint | undefined
  let orderParams: EthFlowOrderParams | undefined
  let mined = false
  let filled = false

  stubEthFlowSend(wallet, (value, order) => {
    sentValue = value
    orderParams = order
  })

  await mockEthFlowTxLookupFallback(context, wallet.address, () => mined)

  await installNativeBalanceRoute({
    context,
    owner: wallet.address,
    txHash: FAKE_ETH_FLOW_TX_HASH,
    getBalance: () => initialEthBalance - (sentValue ?? 0n),
    isMined: () => mined,
  })

  return {
    getSentValue: () => sentValue,
    getTxHash: () => FAKE_ETH_FLOW_TX_HASH,
    confirmMined: () => {
      mined = true
    },
    isMined: () => mined,
    getOrderParams: () => orderParams,
    confirmFilled: () => {
      filled = true
    },
    isFilled: () => filled,
  }
}

function buildReceipt(txHash: string): unknown {
  return {
    transactionHash: txHash,
    status: '0x1',
    blockNumber: '0x1',
    blockHash: `0x${'cd'.repeat(32)}`,
    contractAddress: null,
    cumulativeGasUsed: '0x5208',
    gasUsed: '0x5208',
    effectiveGasPrice: '0x3b9aca00',
    logs: [],
    logsBloom: `0x${'0'.repeat(512)}`,
    transactionIndex: '0x0',
    type: '0x0',
  }
}

/** A plausible-looking, mined `eth_getTransactionByHash` result — mirrors `buildReceipt`'s made-up
 * but shape-correct fields (same fake block, same flat gas figures), plus the sender/value/nonce
 * fields a receipt doesn't carry but a full transaction object does. */
function buildTransaction(txHash: string, from: string): unknown {
  return {
    hash: txHash,
    blockNumber: '0x1',
    blockHash: `0x${'cd'.repeat(32)}`,
    transactionIndex: '0x0',
    from,
    to: null,
    value: '0x0',
    nonce: '0x0',
    gas: FAKE_GAS_ESTIMATE,
    gasPrice: '0x3b9aca00',
    input: '0x',
    type: '0x0',
    v: '0x1',
    r: `0x${'11'.repeat(32)}`,
    s: `0x${'22'.repeat(32)}`,
  }
}

function buildTxLookupResult(entry: TxLookupEntry, mined: boolean, from: string): unknown {
  if (!mined) return null
  return entry.kind === 'receipt' ? buildReceipt(FAKE_ETH_FLOW_TX_HASH) : buildTransaction(FAKE_ETH_FLOW_TX_HASH, from)
}

/** Recognizes `eth_getTransactionReceipt`/`eth_getTransactionByHash` for the ETH-flow creation tx,
 * regardless of which entry in a batch it is. */
function classifyTxLookup(entry: JsonRpcEntry): TxLookupEntry | undefined {
  if (entry?.params?.[0] !== FAKE_ETH_FLOW_TX_HASH) return undefined
  if (entry.method === 'eth_getTransactionReceipt') return { kind: 'receipt' }
  if (entry.method === 'eth_getTransactionByHash') return { kind: 'transaction' }
  return undefined
}

/** Decodes `createOrder(EthFlowOrder.Data)`'s single struct argument straight off the sent calldata. */
function decodeEthFlowOrderParams(data: Hex | undefined): EthFlowOrderParams | undefined {
  if (!data) return undefined
  try {
    const payload = `0x${data.slice(10)}` as Hex
    const [order] = decodeAbiParameters(ETH_FLOW_ORDER_TUPLE, payload)
    return order as EthFlowOrderParams
  } catch {
    return undefined
  }
}

/**
 * Same class of bug documented on `mockEthEstimateGas` (now `installEthEstimateGas`), but for the
 * two polls the app runs *after* sending the creation tx rather than before it: tracing real RPC
 * traffic for the bridging ETH-flow path (`[CC-13]`) found `eth_getTransactionReceipt` AND
 * `eth_getTransactionByHash` for this exact tx hash going out to a real Infura/WalletConnect-relay
 * host — unpredictable and outside any one configured RPC URL's control (see AGENTS.md), so this is
 * registered host-agnostically, matching by tx hash rather than by host. `eth_getTransactionReceipt`
 * for this hash is also answered by `installNativeBalanceRoute` below, itself host-agnostic — the
 * overlap is harmless (both compute the same result from the same `isMined` flag); this function's
 * distinct job is `eth_getTransactionByHash`, which that route doesn't cover.
 *
 * Built on `mockRpcNodeRequest` rather than hand-rolling the same route/body-parsing/batch plumbing
 * `installNativeBalanceRoute` already shares it with.
 */
async function mockEthFlowTxLookupFallback(
  context: BrowserContext,
  from: string,
  isMined: () => boolean,
): Promise<void> {
  const resolve = (entry: JsonRpcEntry): unknown => {
    const lookup = classifyTxLookup(entry)
    return lookup ? buildTxLookupResult(lookup, isMined(), from) : undefined
  }

  mockRpcNodeRequest(
    context,
    ['eth_getTransactionReceipt', 'eth_getTransactionByHash'],
    resolve,
    (entry) => classifyTxLookup(entry) !== undefined,
  )
}

/** Wires the ETH-flow creation tx's `eth_sendTransaction` stub, decoding the sent value/order struct
 * before handing them off to the caller — pulled out of `mockEthFlowTransaction` itself purely to
 * keep that function under this repo's `max-lines-per-function` limit. */
function stubEthFlowSend(
  wallet: Pick<MockWalletApi, 'stubRpc'>,
  onSent: (value: bigint, order: EthFlowOrderParams | undefined) => void,
): void {
  wallet.stubRpc('eth_sendTransaction', (({ params }) => {
    const tx = params[0] as { value?: string; data?: Hex }
    onSent(BigInt(tx.value ?? '0x0'), decodeEthFlowOrderParams(tx.data))
    return FAKE_ETH_FLOW_TX_HASH
  }) as RpcStub)
}
