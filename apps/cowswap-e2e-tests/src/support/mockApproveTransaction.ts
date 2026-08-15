import { decodeFunctionData, encodeAbiParameters, encodeEventTopics, erc20Abi, type Hex } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { mockRpcNodeRequest } from './mockRpcNodeRequest'

import { RpcStub } from '../mockWallet/walletEngine'

import type { JsonRpcEntry } from './mockRpcNodeRequest'
import type { MockWalletApi } from '../fixtures/mockWallet'
import type { AllowancesMock } from '../mocks/allowances'
import type { BrowserContext } from '@playwright/test'

const FAKE_APPROVE_TX_HASH = `0x${'ab'.repeat(32)}` as const

/** `approve(address,uint256)` selector — what the preflight `eth_call` this mock also stubs is checking won't revert. */
export const APPROVE_SELECTOR = '0x095ea7b3'
/** ABI-encoded `true` — the only thing a `bool`-returning `eth_call` needs to report success. */
export const APPROVE_CALL_SUCCESS_RESULT = encodeAbiParameters([{ type: 'bool' }], [true])

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
 * parallel load — so it's matched host-agnostically by `to`/`data` (like `mocks/socketVerifier.ts`)
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

  // Every `eth_getTransactionReceipt` on this rpcUrl is ours to answer — our own fake hash gets a
  // real-looking receipt, anything else (e.g. a stale poll for a since-superseded hash) reads as
  // not-yet-mined (`null`) rather than being forwarded, so this never needs an upstream fetch on
  // its own; only a batch mixing in some *other* method defers to upstream for that other entry.
  mockRpcNodeRequest(
    context,
    'eth_getTransactionReceipt',
    (entry) => buildReceiptRpcResponse(entry, { owner: wallet.address, token, spender, amount: approvedAmount }),
    () => true,
    rpcUrl,
  )

  // The preflight `approve()` simulation (see this file's own doc comment) is host-agnostic and
  // never batched in practice, but `mockRpcNodeRequest` handles a mixed batch just as well.
  mockRpcNodeRequest(
    context,
    'eth_call',
    (entry) => (isApproveSimulationCall(entry, token) ? APPROVE_CALL_SUCCESS_RESULT : undefined),
    (entry) => isApproveSimulationCall(entry, token),
  )

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

/** The receipt result for one `eth_getTransactionReceipt` entry — our own fake hash gets a real result, everything else (including a stale poll for a since-superseded hash) reads as not-yet-mined. */
function buildReceiptRpcResponse(entry: JsonRpcEntry, ctx: ReceiptContext): unknown {
  const isOurReceipt = entry.params[0] === FAKE_APPROVE_TX_HASH
  return isOurReceipt ? buildApproveReceipt(ctx) : null
}

/** Matches the preflight `eth_call` simulating `approve(address,uint256)` against the same token this mock was set up for, before the real `eth_sendTransaction` is ever asked for. */
function isApproveSimulationCall(entry: JsonRpcEntry | null | undefined, token: string): boolean {
  if (entry?.method !== 'eth_call') return false
  const call = entry.params?.[0] as { to?: string; data?: string } | undefined
  if (!call?.to || !call?.data) return false
  return areAddressesEqual(call.to, token) && call.data.toLowerCase().startsWith(APPROVE_SELECTOR)
}
