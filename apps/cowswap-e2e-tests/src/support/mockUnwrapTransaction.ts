import { decodeAbiParameters, type Hex } from 'viem'

import { installNativeBalanceRoute } from './mockEthFlowTransaction'

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
    if (sentValue !== undefined) {
      throw new Error('mockUnwrapTransaction: only one unwrap transaction is supported per handle')
    }
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

  // ETH is credited back the moment the fake tx is "sent" — same timing `mockWrapTransaction`
  // debits it, and the same reasoning as `mockEthFlowTransaction`'s own native-balance patch.
  await installNativeBalanceRoute({
    context,
    rpcUrl,
    owner: wallet.address,
    txHash: FAKE_UNWRAP_TX_HASH,
    getBalance: () => initialEthBalance + (sentValue ?? 0n),
    isMined: () => mined,
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
