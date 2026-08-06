import { decodeFunctionData, encodeAbiParameters, encodeEventTopics, erc20Abi, type Hex } from 'viem'

import { RpcStub } from '../mockWallet/walletEngine'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { AllowancesMock } from '../mocks/allowances'
import type { BrowserContext } from '@playwright/test'

const FAKE_APPROVE_TX_HASH = `0x${'ab'.repeat(32)}` as const

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
    if (!entries.some((entry) => entry.method === 'eth_getTransactionReceipt')) {
      return route.fallback()
    }

    const payload = entries.map((entry) =>
      buildReceiptRpcResponse(entry, { owner: wallet.address, token, spender, amount: approvedAmount }),
    )
    await route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
  })

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
