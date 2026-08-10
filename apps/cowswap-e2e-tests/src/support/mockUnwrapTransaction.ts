import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

import {
  classifyEthCall,
  isFullyMocked,
  resolveEthBalanceBatch,
  type ClassifiedEthCall,
} from './mockEthFlowTransaction'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { BalancesMock } from '../mocks/balances'
import type { RpcStub } from '../mockWallet/walletEngine'
import type { BrowserContext } from '@playwright/test'

const UINT256 = [{ type: 'uint256' }] as const

const FAKE_UNWRAP_TX_HASH = `0x${'20'.repeat(32)}` as const

/** `withdraw(uint256)` on WETH9 — verified via `viem`'s `toFunctionSelector('withdraw(uint256)')`. */
const WITHDRAW_SELECTOR = '0x2e1a7d4d'

export interface MockUnwrapTransactionHandle {
  /** The WETH amount (wei) actually passed to the fake `withdraw()` transaction, once sent. */
  getSentValue(): bigint | undefined
  getTxHash(): string
  /** Marks the unwrap tx as mined, so `eth_getTransactionReceipt` starts reporting success. */
  confirmMined(): void
  isMined(): boolean
}

export interface MockUnwrapTransactionOpts {
  context: BrowserContext
  wallet: Pick<MockWalletApi, 'address' | 'stubRpc'>
  balances: BalancesMock
  chainId: number
  wethToken: string
  initialEthBalance: bigint
  initialWethBalance: bigint
}

type ClassifiedEntry = { kind: 'receipt' } | { kind: 'call'; call: ClassifiedEthCall } | { kind: 'opaque' }

interface JsonRpcEntry {
  id: number | string
  method: string
  params: unknown[]
  result?: unknown
}

/**
 * Fakes the native-ETH unwrap transaction end-to-end — the reverse of `mockWrapTransaction`.
 * Unwrapping is a plain `withdraw(uint256)` call on the WETH contract
 * (`legacy/hooks/useWrapCallback.ts`'s `unwrapContractCall`) — not a CoW order at all, so none of
 * this suite's order-posting mocks apply. `eth_sendTransaction` goes through the connected wallet
 * (stubbed here), same channel `mockWrapTransaction`/`mockEthFlowTransaction` use. Unlike wrapping
 * (whose sent amount is the tx's own `value`), `withdraw`'s amount is a calldata argument — there's
 * no ETH sent *to* the WETH contract, ETH comes *back* from it. The WETH side is debited directly
 * through the normal `mocks.balances` SSE-watcher mock (WETH is a real ERC-20, no special handling
 * needed) the moment the tx is "sent". The ETH side needs the same Multicall3 `getEthBalance`
 * decode/patch `mockEthFlowTransaction` already built (native ETH balance is read that way, not via
 * a bare `eth_getBalance`), reused here rather than duplicated — just added to the starting balance
 * instead of subtracted from it.
 */
export async function mockUnwrapTransaction(opts: MockUnwrapTransactionOpts): Promise<MockUnwrapTransactionHandle> {
  const { context, wallet, balances, chainId, wethToken, initialEthBalance, initialWethBalance } = opts
  const rpcUrl = process.env[`REACT_APP_NETWORK_URL_${chainId}`]
  if (!rpcUrl) throw new Error(`REACT_APP_NETWORK_URL_${chainId} not set`)

  let sentValue: bigint | undefined
  let mined = false

  const stub: RpcStub = ({ params }) => {
    const tx = params[0] as { data?: Hex }
    const data = tx.data ?? '0x'
    if (!data.toLowerCase().startsWith(WITHDRAW_SELECTOR)) {
      throw new Error(`mockUnwrapTransaction: expected a withdraw() call, got calldata ${data}`)
    }
    const [amount] = decodeAbiParameters(UINT256, `0x${data.slice(10)}` as Hex)
    sentValue = amount
    balances.set(wallet.address, chainId, { [wethToken]: initialWethBalance - sentValue })
    return FAKE_UNWRAP_TX_HASH
  }
  wallet.stubRpc('eth_sendTransaction', stub)

  const classify = (entry: JsonRpcEntry): ClassifiedEntry => {
    if (entry.method === 'eth_getTransactionReceipt' && entry.params[0] === FAKE_UNWRAP_TX_HASH) {
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

  const buildResult = (classified: ClassifiedEntry, ethBalance: bigint, upstream?: Hex): unknown => {
    if (classified.kind === 'receipt') return mined ? buildReceipt() : null
    if (classified.kind === 'call') {
      if (classified.call.kind === 'ownBalance') return encodeAbiParameters(UINT256, [ethBalance])
      if (classified.call.kind === 'opaque') return undefined
      return resolveEthBalanceBatch(classified.call, ethBalance, upstream)
    }
    return undefined
  }

  await context.route(rpcUrl, async (route) => {
    const body = route.request().postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    const entries = Array.isArray(body) ? body : [body]
    const classified = entries.map(classify)

    if (classified.every((c) => c.kind === 'opaque')) return route.fallback()

    // ETH is credited back the moment the fake tx is "sent" — same timing `mockWrapTransaction`
    // debits it, and the same reasoning as `mockEthFlowTransaction`'s own native-balance patch.
    const ethBalance = initialEthBalance + (sentValue ?? 0n)

    if (classified.every(isEntryFullyMocked)) {
      const payload = entries.map((entry, i) => ({
        jsonrpc: '2.0',
        id: entry.id,
        result: buildResult(classified[i], ethBalance),
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
      return { jsonrpc: '2.0', id: entry.id, result: buildResult(classifiedEntry, ethBalance, upstreamResult) }
    })
    return route.fulfill({ json: Array.isArray(upstreamBody) ? payload : payload[0] })
  })

  return {
    getSentValue: () => sentValue,
    getTxHash: () => FAKE_UNWRAP_TX_HASH,
    confirmMined: () => {
      mined = true
    },
    isMined: () => mined,
  }
}

function buildReceipt(): unknown {
  return {
    transactionHash: FAKE_UNWRAP_TX_HASH,
    status: '0x1',
    blockNumber: '0x1',
    blockHash: `0x${'ab'.repeat(32)}`,
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
