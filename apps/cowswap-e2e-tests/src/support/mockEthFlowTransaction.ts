import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { RpcStub } from '../mockWallet/walletEngine'
import type { BrowserContext, Route } from '@playwright/test'

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

export interface OpaqueCall {
  kind: 'opaque'
}

export interface OwnBalanceCall {
  kind: 'ownBalance'
}

interface BatchResultSlot {
  success: boolean
  returnData: Hex
}

const OPAQUE: OpaqueCall = { kind: 'opaque' }

/**
 * Classifies one `eth_call` payload for `owner`'s own ETH balance, recursively — mirrors
 * `mocks/allowances/codec.ts`'s `classifyCall`, since Multicall3 batches nest the same way
 * regardless of what's inside them. Recognizing `getEthBalance(owner)` wherever it appears inside
 * a batch (rather than requiring the *whole* batch to be nothing but that) is what keeps this from
 * ever needing to forward the owner's real balance to the real RPC just because some other,
 * unrelated read got bundled into the same Multicall3 call.
 */
export function classifyEthCall(data: Hex, owner: string): ClassifiedEthCall {
  const selector = data.slice(0, 10).toLowerCase()

  if (selector === GET_ETH_BALANCE_SELECTOR) {
    try {
      const [address] = decodeAbiParameters([{ type: 'address' }], `0x${data.slice(10)}` as Hex)
      return (address as string).toLowerCase() === owner.toLowerCase() ? { kind: 'ownBalance' } : OPAQUE
    } catch {
      return OPAQUE
    }
  }

  if (selector === AGGREGATE3_SELECTOR) {
    try {
      const [calls] = decodeAbiParameters(CALL3_TUPLE, `0x${data.slice(10)}` as Hex)
      return {
        kind: 'batch',
        calls: (calls as ReadonlyArray<{ callData: Hex }>).map((c) => classifyEthCall(c.callData, owner)),
      }
    } catch {
      return OPAQUE
    }
  }

  return OPAQUE
}

export function isFullyMocked(call: ClassifiedEthCall): boolean {
  if (call.kind === 'ownBalance') return true
  if (call.kind === 'opaque') return false
  return call.calls.every(isFullyMocked)
}

/**
 * Builds the `Result[]` blob for a batch, patching only the `ownBalance` slots and leaving every
 * other slot as whatever the real upstream response had for it (or a failure slot if there's no
 * upstream at all, i.e. the batch turned out to be nothing but `ownBalance` calls). Same
 * upstream-as-base technique as `codec.ts`'s `resolveBatchResult`.
 */
export function resolveEthBalanceBatch(call: BatchCall, balance: bigint, upstream?: Hex): Hex {
  const base = upstream ? decodeResultSlots(upstream) : []

  const slots = call.calls.map((inner, index) => {
    const fallback = base[index] ?? { success: false, returnData: '0x' as Hex }

    if (inner.kind === 'ownBalance') {
      return { success: true, returnData: encodeAbiParameters(UINT256, [balance]) }
    }
    if (inner.kind === 'batch') {
      const nestedUpstream = fallback.success ? fallback.returnData : undefined
      return { success: true, returnData: resolveEthBalanceBatch(inner, balance, nestedUpstream) }
    }
    return fallback
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
  chainId: number
  initialEthBalance: bigint
}

type ClassifiedEntry = { kind: 'receipt' } | { kind: 'call'; call: ClassifiedEthCall } | { kind: 'opaque' }

/** A generous flat estimate for the `createOrder()` call — never actually spent, since the send itself is stubbed. */
const FAKE_GAS_ESTIMATE = '0x7a120' as const

interface JsonRpcEntry {
  id: number | string
  method: string
  params: unknown[]
  result?: unknown
}

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
 */
export async function mockEthFlowTransaction(opts: MockEthFlowTransactionOpts): Promise<MockEthFlowTransactionHandle> {
  const { context, wallet, chainId, initialEthBalance } = opts
  const rpcUrl = process.env[`REACT_APP_NETWORK_URL_${chainId}`]
  if (!rpcUrl) throw new Error(`REACT_APP_NETWORK_URL_${chainId} not set`)

  let sentValue: bigint | undefined
  let orderParams: EthFlowOrderParams | undefined
  let mined = false
  let filled = false

  stubEthFlowSend(wallet, (value, order) => {
    sentValue = value
    orderParams = order
  })

  const classify = (entry: JsonRpcEntry): ClassifiedEntry => {
    if (entry.method === 'eth_getTransactionReceipt' && entry.params[0] === FAKE_ETH_FLOW_TX_HASH) {
      return { kind: 'receipt' }
    }
    if (entry.method === 'eth_call') {
      const call = entry.params[0] as { data?: Hex }
      if (call.data) {
        const classifiedCall = classifyEthCall(call.data, wallet.address)
        if (classifiedCall.kind !== 'opaque') return { kind: 'call', call: classifiedCall }
      }
    }
    return { kind: 'opaque' }
  }

  const isEntryFullyMocked = (entry: ClassifiedEntry): boolean =>
    entry.kind === 'receipt' || (entry.kind === 'call' && isFullyMocked(entry.call))

  const buildResult = (classified: ClassifiedEntry, remainingBalance: bigint, upstream?: Hex): unknown => {
    if (classified.kind === 'receipt') return mined ? buildReceipt(FAKE_ETH_FLOW_TX_HASH) : null
    if (classified.kind === 'call') {
      if (classified.call.kind === 'ownBalance') return encodeAbiParameters(UINT256, [remainingBalance])
      if (classified.call.kind === 'opaque') return undefined
      return resolveEthBalanceBatch(classified.call, remainingBalance, upstream)
    }
    return undefined
  }

  await mockEthFlowTxLookupFallback(context, wallet.address, () => mined)

  await context.route(rpcUrl, async (route) => {
    const body = route.request().postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    const entries = Array.isArray(body) ? body : [body]
    const classified = entries.map(classify)

    if (classified.every((c) => c.kind === 'opaque')) return route.fallback()

    const remainingBalance = initialEthBalance - (sentValue ?? 0n)

    if (classified.every(isEntryFullyMocked)) {
      const payload = entries.map((entry, i) => ({
        jsonrpc: '2.0',
        id: entry.id,
        result: buildResult(classified[i], remainingBalance),
      }))
      return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
    }

    // Some entries need real data (fully opaque, or a batch only partially recognized) — fetch
    // upstream and patch in only what's actually mocked, same merge technique as the allowances mock.
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]

    const classifiedById = new Map<number | string, ClassifiedEntry>()
    entries.forEach((entry, i) => classifiedById.set(entry.id, classified[i]))

    const payload = upstreamEntries.map((entry) => {
      const classifiedEntry = classifiedById.get(entry.id)
      if (!classifiedEntry || classifiedEntry.kind === 'opaque') return entry
      const upstreamResult = typeof entry.result === 'string' ? (entry.result as Hex) : undefined
      return { jsonrpc: '2.0', id: entry.id, result: buildResult(classifiedEntry, remainingBalance, upstreamResult) }
    })
    return route.fulfill({ json: Array.isArray(upstreamBody) ? payload : payload[0] })
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
 * host that sometimes 429s — not the configured `REACT_APP_NETWORK_URL_{chainId}` this file's
 * `context.route(rpcUrl, ...)` handler below is scoped to, so that handler's own (receipt-only)
 * mocking never saw them. Registered host-agnostically, alongside `installEthEstimateGas`, as a
 * second line of defense: for the configured RPC host, `context.route(rpcUrl, ...)` (registered
 * after this one) still wins and answers first, so there's no double-handling; this one only ever
 * fires for the *other*, unpredictable hosts the app's own independent client happens to pick.
 */
async function mockEthFlowTxLookupFallback(
  context: BrowserContext,
  from: string,
  isMined: () => boolean,
): Promise<void> {
  await context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()
    let body: JsonRpcEntry | JsonRpcEntry[]
    try {
      body = request.postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    } catch {
      return route.fallback()
    }
    const entries = Array.isArray(body) ? body : [body]
    const classified = entries.map(classifyTxLookup)
    if (!entries.length || classified.some((c) => !c)) return route.fallback()

    const mined = isMined()
    const payload = entries.map((entry, i) => ({
      jsonrpc: '2.0',
      id: entry.id,
      result: buildTxLookupResult(classified[i] as TxLookupEntry, mined, from),
    }))
    return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
  })
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
