import { decodeFunctionData, encodeAbiParameters, encodeEventTopics, erc20Abi, type Hex } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { RpcStub } from '../mockWallet/walletEngine'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { AllowancesMock } from '../mocks/allowances'
import type { BrowserContext, Route } from '@playwright/test'

const FAKE_APPROVE_TX_HASH = `0x${'ab'.repeat(32)}` as const

/** `approve(address,uint256)` selector — what the preflight `eth_call` this mock also stubs is checking won't revert. */
const APPROVE_SELECTOR = '0x095ea7b3'
/** ABI-encoded `true` — the only thing a `bool`-returning `eth_call` needs to report success. */
const APPROVE_CALL_SUCCESS_RESULT = encodeAbiParameters([{ type: 'bool' }], [true])

export interface MockApproveTransactionHandle {
  /** The raw amount decoded from the actual approve(spender, amount) calldata, once sent. */
  getApprovedAmount(): bigint | undefined
}

export interface MockApproveTransactionOpts {
  context: BrowserContext
  wallet: Pick<MockWalletApi, 'address' | 'stubRpc'>
  allowances: AllowancesMock
  chainId: number
  token: string
}

interface JsonRpcEntry {
  id: number | string
  method: string
  params: unknown[]
}

interface ReceiptContext {
  owner: string
  token: string
  spender: Hex | undefined
  amount: bigint | undefined
}

/**
 * Fakes an ERC20 `approve()` end-to-end instead of letting it broadcast for real: the
 * `eth_sendTransaction` itself goes through the connected wallet (stubbed here), but the
 * confirmation poll that follows it (`eth_getTransactionReceipt`) goes through the app's own
 * direct RPC client straight to `REACT_APP_NETWORK_URL_<chainId>` — the same wire
 * `mocks.balances`/`mocks.allowances` intercept — bypassing the wallet entirely, so it needs its
 * own route stub. The allowance mock is also kept in sync, since faking the send doesn't change
 * anything the real allowance-read mock would otherwise report.
 *
 * Before ever reaching that stubbed `eth_sendTransaction`, the wallet-connector layer also fires a
 * preflight, non-batched `eth_call` for the same `approve(address,uint256)` calldata — a
 * simulate-before-sign check that the call won't revert. Tracing real RPC traffic
 * (`LOG_UNMOCKED_RPC=1`) showed this going straight to a real, hardcoded provider (Infura) rather
 * than any URL this suite controls, and getting rate-limited (HTTP 429) under `pnpm e2e`'s full
 * parallel load — so it's matched host-agnostically by `to`/`data` (like `mockSocketVerifier.ts`)
 * and answered with a successful ABI-encoded `true`, same as the real call would return.
 */
export async function mockApproveTransaction(opts: MockApproveTransactionOpts): Promise<MockApproveTransactionHandle> {
  const { context, wallet, allowances, chainId, token } = opts
  const rpcUrl = process.env[`REACT_APP_NETWORK_URL_${chainId}`]
  if (!rpcUrl) throw new Error(`REACT_APP_NETWORK_URL_${chainId} not set`)

  let approvedAmount: bigint | undefined
  let spender: Hex | undefined

  const stub: RpcStub = ({ params }) => {
    const tx = params[0] as { data?: Hex }
    // Ground truth: decode the actual approve(spender, amount) calldata rather than trusting the
    // UI's rendered figure.
    const { args } = decodeFunctionData({ abi: erc20Abi, data: tx.data as Hex })
    spender = args[0] as Hex
    approvedAmount = args[1] as bigint
    allowances.set(wallet.address, chainId, { [token]: approvedAmount })
    return FAKE_APPROVE_TX_HASH
  }
  wallet.stubRpc('eth_sendTransaction', stub)

  await context.route(rpcUrl, async (route) => {
    const body = route.request().postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    const entries = Array.isArray(body) ? body : [body]
    const isReceiptEntry = entries.map((entry) => entry.method === 'eth_getTransactionReceipt')
    if (!isReceiptEntry.some(Boolean)) return route.fallback()

    const ctx: ReceiptContext = { owner: wallet.address, token, spender, amount: approvedAmount }

    if (isReceiptEntry.every(Boolean)) {
      const payload = entries.map((entry) => buildReceiptRpcResponse(entry, ctx))
      return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
    }

    // A mixed batch — only the receipt entries are ours to answer; fetch upstream and patch just
    // those in, so a non-receipt read bundled alongside our poll doesn't get nulled out.
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const receiptIds = new Set(entries.filter((_, i) => isReceiptEntry[i]).map((entry) => entry.id))
    const payload = upstreamEntries.map((entry) =>
      receiptIds.has(entry.id) ? buildReceiptRpcResponse(entry, ctx) : entry,
    )
    return route.fulfill({ json: Array.isArray(upstreamBody) ? payload : payload[0] })
  })

  await context.route('**/*', (route) => handleApproveSimulationCall(route, token))

  return {
    getApprovedAmount: () => approvedAmount,
  }
}

/**
 * `useApproveAndSwap` confirms the approved amount by parsing the receipt's `Approval` log (not
 * by re-reading `allowance()`) — an empty `logs: []` reads as "approval failed".
 */
function buildApproveReceipt(ctx: ReceiptContext): unknown {
  const approvalLog = {
    address: ctx.token,
    topics: encodeEventTopics({
      abi: erc20Abi,
      eventName: 'Approval',
      args: { owner: ctx.owner as Hex, spender: ctx.spender as Hex },
    }),
    data: encodeAbiParameters([{ type: 'uint256' }], [ctx.amount as bigint]),
    blockNumber: '0x2783872',
    transactionHash: FAKE_APPROVE_TX_HASH,
    transactionIndex: '0x0',
    blockHash: `0x${'cd'.repeat(32)}`,
    logIndex: '0x0',
    removed: false,
  }

  return {
    transactionHash: FAKE_APPROVE_TX_HASH,
    status: '0x1',
    blockNumber: '0x1',
    blockHash: `0x${'cd'.repeat(32)}`,
    contractAddress: null,
    cumulativeGasUsed: '0x5208',
    gasUsed: '0x5208',
    effectiveGasPrice: '0x3b9aca00',
    logs: [approvalLog],
    logsBloom: `0x${'0'.repeat(512)}`,
    transactionIndex: '0x0',
    from: ctx.owner,
    to: ctx.token,
    type: '0x0',
  }
}

/** A JSON-RPC response for one batched request — only `eth_getTransactionReceipt` for our own fake hash gets a real result, everything else (including a stale poll for a since-superseded hash) reads as not-yet-mined. */
function buildReceiptRpcResponse(
  entry: JsonRpcEntry,
  ctx: ReceiptContext,
): { jsonrpc: '2.0'; id: number | string; result: unknown } {
  const isOurReceipt = entry.method === 'eth_getTransactionReceipt' && entry.params[0] === FAKE_APPROVE_TX_HASH
  return { jsonrpc: '2.0', id: entry.id, result: isOurReceipt ? buildApproveReceipt(ctx) : null }
}

/**
 * Not observed in practice (this preflight is always a standalone, non-batched `eth_call`) — but if
 * it ever turns up mixed with other, unrecognized calls, fetch the real upstream and patch in only
 * the entries this mock actually understands, rather than fabricate data for the rest. Same
 * try/catch → `route.fallback()` guard as `mockSocketVerifier.ts`'s `fulfillFromUpstream`, so a
 * transient real-RPC hiccup here can't abort the whole request.
 */
async function fulfillApproveSimulationFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  matches: boolean[],
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const matchedIds = new Set(entries.filter((_, i) => matches[i]).map((entry) => entry.id))
    const payload = upstreamEntries.map((entry) =>
      matchedIds.has(entry.id) ? { jsonrpc: '2.0', id: entry.id, result: APPROVE_CALL_SUCCESS_RESULT } : entry,
    )
    await route.fulfill({ json: Array.isArray(upstreamBody) ? payload : payload[0] })
  } catch {
    await route.fallback()
  }
}

/**
 * Answers the preflight `approve(address,uint256)` simulation `eth_call` (see the doc comment on
 * `mockApproveTransaction`) with a successful `true`, host-agnostically. Unlike `mockSocketVerifier.ts`,
 * this call is never wrapped in a Multicall3 batch in practice (confirmed by tracing real RPC
 * traffic), so no batch-decoding is needed — just the single/array JSON-RPC envelope every route in
 * this suite already has to handle.
 */
async function handleApproveSimulationCall(route: Route, token: string): Promise<void> {
  const request = route.request()
  if (request.method() !== 'POST') return route.fallback()

  let body: JsonRpcEntry | JsonRpcEntry[] | null
  try {
    // Unlike `route.request().postDataJSON()` elsewhere in this file (only ever called against a
    // known JSON-RPC endpoint), this route sees every request in the page — `postDataJSON()`
    // returns `null` rather than throwing for a POST with no/non-JSON body (e.g. an analytics
    // beacon), so that has to be checked explicitly, not just guarded by try/catch.
    body = request.postDataJSON() as JsonRpcEntry | JsonRpcEntry[] | null
  } catch {
    return route.fallback()
  }
  if (!body) return route.fallback()

  const entries = Array.isArray(body) ? body : [body]
  const matches = entries.map((entry) => isApproveSimulationCall(entry, token))
  if (!matches.some(Boolean)) return route.fallback()

  if (matches.every(Boolean)) {
    const payload = entries.map((entry) => ({ jsonrpc: '2.0', id: entry.id, result: APPROVE_CALL_SUCCESS_RESULT }))
    return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
  }

  return fulfillApproveSimulationFromUpstream(route, entries, matches)
}

/** Matches the preflight `eth_call` simulating `approve(address,uint256)` against the same token this mock was set up for, before the real `eth_sendTransaction` is ever asked for. */
function isApproveSimulationCall(entry: JsonRpcEntry | null | undefined, token: string): boolean {
  if (entry?.method !== 'eth_call') return false
  const call = entry.params?.[0] as { to?: string; data?: string } | undefined
  if (!call?.to || !call?.data) return false
  return areAddressesEqual(call.to, token) && call.data.toLowerCase().startsWith(APPROVE_SELECTOR)
}
