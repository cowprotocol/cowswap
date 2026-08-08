import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

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

type ClassifiedEntry = { kind: 'receipt' } | { kind: 'ethBalance'; callCount: number } | { kind: 'opaque' }

interface JsonRpcEntry {
  id: number | string
  method: string
  params: unknown[]
}

/**
 * Recognizes an `aggregate3` batch where every inner call is Multicall3's own
 * `getEthBalance(owner)` for `owner`. Returns the call count (== how many result slots to fill)
 * or `undefined` if the calldata isn't such a batch — a mixed batch (some other read alongside a
 * balance read) isn't something real traffic has shown happening, so it's left unhandled here
 * rather than guessed at.
 */
export function countOwnEthBalanceCalls(data: Hex | undefined, owner: string): number | undefined {
  if (!data || !data.toLowerCase().startsWith(AGGREGATE3_SELECTOR)) return undefined
  try {
    const payload = `0x${data.slice(10)}` as Hex
    const [calls] = decodeAbiParameters(CALL3_TUPLE, payload)
    const isOwnBalanceCall = (call: { callData: string }): boolean => {
      if (!call.callData.toLowerCase().startsWith(GET_ETH_BALANCE_SELECTOR)) return false
      const [address] = decodeAbiParameters([{ type: 'address' }], `0x${call.callData.slice(10)}` as Hex)
      return (address as string).toLowerCase() === owner.toLowerCase()
    }
    const callList = calls as ReadonlyArray<{ callData: string }>
    return callList.length > 0 && callList.every(isOwnBalanceCall) ? callList.length : undefined
  } catch {
    return undefined
  }
}

export function encodeEthBalanceResult(callCount: number, balance: bigint): Hex {
  const slot = { success: true, returnData: encodeAbiParameters([{ type: 'uint256' }], [balance]) }
  return encodeAbiParameters(RESULT_TUPLE, [Array.from({ length: callCount }, () => slot)])
}

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

  const stub: RpcStub = ({ params }) => {
    const tx = params[0] as { value?: string; data?: Hex }
    sentValue = BigInt(tx.value ?? '0x0')
    orderParams = decodeEthFlowOrderParams(tx.data)
    return FAKE_ETH_FLOW_TX_HASH
  }
  wallet.stubRpc('eth_sendTransaction', stub)

  const classify = (entry: JsonRpcEntry): ClassifiedEntry => {
    if (entry.method === 'eth_getTransactionReceipt' && entry.params[0] === FAKE_ETH_FLOW_TX_HASH) {
      return { kind: 'receipt' }
    }
    if (entry.method === 'eth_call') {
      const call = entry.params[0] as { data?: Hex }
      const callCount = countOwnEthBalanceCalls(call.data, wallet.address)
      if (callCount !== undefined) return { kind: 'ethBalance', callCount }
    }
    return { kind: 'opaque' }
  }

  const buildResult = (classified: ClassifiedEntry, remainingBalance: bigint): unknown => {
    if (classified.kind === 'receipt') return mined ? buildReceipt() : null
    if (classified.kind === 'ethBalance') return encodeEthBalanceResult(classified.callCount, remainingBalance)
    return undefined
  }

  await context.route(rpcUrl, async (route) => {
    const body = route.request().postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    const entries = Array.isArray(body) ? body : [body]
    const classified = entries.map(classify)

    if (classified.every((c) => c.kind === 'opaque')) return route.fallback()

    const remainingBalance = initialEthBalance - (sentValue ?? 0n)

    if (classified.every((c) => c.kind !== 'opaque')) {
      const payload = entries.map((entry, i) => ({
        jsonrpc: '2.0',
        id: entry.id,
        result: buildResult(classified[i], remainingBalance),
      }))
      return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
    }

    // Mixed batch: fetch the real response for the entries we don't own, patch in ours by id.
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]

    const classifiedById = new Map<number | string, ClassifiedEntry>()
    entries.forEach((entry, i) => classifiedById.set(entry.id, classified[i]))

    const payload = upstreamEntries.map((entry) => {
      const classifiedEntry = classifiedById.get(entry.id)
      if (!classifiedEntry || classifiedEntry.kind === 'opaque') return entry
      return { jsonrpc: '2.0', id: entry.id, result: buildResult(classifiedEntry, remainingBalance) }
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

function buildReceipt(): unknown {
  return {
    transactionHash: FAKE_ETH_FLOW_TX_HASH,
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
