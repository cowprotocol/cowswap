import { countOwnEthBalanceCalls, encodeEthBalanceResult } from './mockEthFlowTransaction'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { BalancesMock } from '../mocks/balances'
import type { RpcStub } from '../mockWallet/walletEngine'
import type { BrowserContext } from '@playwright/test'

const FAKE_WRAP_TX_HASH = `0x${'10'.repeat(32)}` as const

export interface MockWrapTransactionHandle {
  /** The native ETH amount (wei) actually sent in the fake `deposit()` transaction, once sent. */
  getSentValue(): bigint | undefined
  getTxHash(): string
  /** Marks the wrap tx as mined, so `eth_getTransactionReceipt` starts reporting success. */
  confirmMined(): void
  isMined(): boolean
}

export interface MockWrapTransactionOpts {
  context: BrowserContext
  wallet: Pick<MockWalletApi, 'address' | 'stubRpc'>
  balances: BalancesMock
  chainId: number
  wethToken: string
  initialEthBalance: bigint
}

type ClassifiedEntry = { kind: 'receipt' } | { kind: 'ethBalance'; callCount: number } | { kind: 'opaque' }

interface JsonRpcEntry {
  id: number | string
  method: string
  params: unknown[]
}

/**
 * Fakes the native-ETH wrap transaction end-to-end. Wrapping is a plain `deposit()` call on the
 * WETH contract (`legacy/hooks/useWrapCallback.ts`) — not a CoW order at all, so none of this
 * suite's order-posting mocks apply. `eth_sendTransaction` goes through the connected wallet
 * (stubbed here), same channel `mockApproveTransaction`/`mockEthFlowTransaction` use. The WETH
 * side is credited directly through the normal `mocks.balances` SSE-watcher mock (WETH is a real
 * ERC-20, no special handling needed) the moment the tx is "sent" — same as `mockApproveTransaction`
 * updates its allowance mock inline. The ETH side needs the same Multicall3 `getEthBalance`
 * decode/patch `mockEthFlowTransaction` already built (native ETH balance is read that way, not
 * via a bare `eth_getBalance` — see that file for how this was confirmed), reused here rather than
 * duplicated.
 */
export async function mockWrapTransaction(opts: MockWrapTransactionOpts): Promise<MockWrapTransactionHandle> {
  const { context, wallet, balances, chainId, wethToken, initialEthBalance } = opts
  const rpcUrl = process.env[`REACT_APP_NETWORK_URL_${chainId}`]
  if (!rpcUrl) throw new Error(`REACT_APP_NETWORK_URL_${chainId} not set`)

  let sentValue: bigint | undefined
  let mined = false

  const stub: RpcStub = ({ params }) => {
    const tx = params[0] as { value?: string }
    sentValue = BigInt(tx.value ?? '0x0')
    balances.set(wallet.address, chainId, { [wethToken]: sentValue })
    return FAKE_WRAP_TX_HASH
  }
  wallet.stubRpc('eth_sendTransaction', stub)

  const classify = (entry: JsonRpcEntry): ClassifiedEntry => {
    if (entry.method === 'eth_getTransactionReceipt' && entry.params[0] === FAKE_WRAP_TX_HASH) {
      return { kind: 'receipt' }
    }
    if (entry.method === 'eth_call') {
      const call = entry.params[0] as { data?: `0x${string}` }
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
    getTxHash: () => FAKE_WRAP_TX_HASH,
    confirmMined: () => {
      mined = true
    },
    isMined: () => mined,
  }
}

function buildReceipt(): unknown {
  return {
    transactionHash: FAKE_WRAP_TX_HASH,
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
