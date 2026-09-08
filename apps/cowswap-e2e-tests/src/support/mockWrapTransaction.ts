import type { Hex } from 'viem'

import { installNativeBalanceRoute } from './mockEthFlowTransaction'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { BalancesMock } from '../mocks/balances'
import type { RpcStub } from '../mockWallet/walletEngine'
import type { BrowserContext } from '@playwright/test'

const FAKE_WRAP_TX_HASH = `0x${'10'.repeat(32)}` as const

/** `deposit()` on WETH9 — verified via `viem`'s `toFunctionSelector('deposit()')`. */
const DEPOSIT_SELECTOR = '0xd0e30db0'

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
  /** WETH the trader already holds before wrapping — `balances.set` replaces the token's value
   * rather than adding to it, so this must be folded into the post-wrap figure explicitly. */
  initialWethBalance: bigint
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
 * via a bare `eth_getBalance` — see that file for how this was confirmed), reused here via
 * `installNativeBalanceRoute` rather than duplicated.
 */
export async function mockWrapTransaction(opts: MockWrapTransactionOpts): Promise<MockWrapTransactionHandle> {
  const { context, wallet, balances, chainId, wethToken, initialEthBalance, initialWethBalance } = opts

  let sentValue: bigint | undefined
  let mined = false

  const stub: RpcStub = ({ params }) => {
    if (sentValue !== undefined) {
      throw new Error('mockWrapTransaction: only one wrap transaction is supported per handle')
    }
    const tx = params[0] as { value?: string; data?: Hex }
    const data = tx.data ?? '0x'
    if (!data.toLowerCase().startsWith(DEPOSIT_SELECTOR)) {
      throw new Error(`mockWrapTransaction: expected a deposit() call, got calldata ${data}`)
    }
    sentValue = BigInt(tx.value ?? '0x0')
    balances.set(wallet.address, chainId, { [wethToken]: initialWethBalance + sentValue })
    return FAKE_WRAP_TX_HASH
  }
  wallet.stubRpc('eth_sendTransaction', stub)

  await installNativeBalanceRoute({
    context,
    owner: wallet.address,
    txHash: FAKE_WRAP_TX_HASH,
    getBalance: () => initialEthBalance - (sentValue ?? 0n),
    isMined: () => mined,
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
