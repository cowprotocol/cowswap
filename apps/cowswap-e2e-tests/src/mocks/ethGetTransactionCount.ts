import { mockRpcNodeRequest } from '../support/mockRpcNodeRequest'

import type { BrowserContext } from '@playwright/test'

// This suite's test wallets are always fresh (a nonce of 0 is genuinely accurate, not just
// convenient), so a single hardcoded value covers every address/block-tag combination.
const HARDCODED_TRANSACTION_COUNT = '0x0'

/**
 * `eth_getTransactionCount` (the wallet's own nonce) goes out as a single, standalone JSON-RPC call
 * (no Multicall3 batching, same as `eth_blockNumber`/`eth_getCode`) to whichever real RPC/Infura
 * endpoint the app's own independent client picked. Traced with
 * `logUnmockedRpcRequests`/`LOG_UNMOCKED_RPC=1`: same class of real, rate-limited dependency as
 * `eth_blockNumber` (`installEthBlockNumber`) that 429s under `pnpm e2e`'s full parallel load.
 */
export function installEthGetTransactionCount(context: BrowserContext): void {
  // No other mock watches `eth_getTransactionCount`, so every call with this method is unambiguously ours.
  mockRpcNodeRequest(
    context,
    'eth_getTransactionCount',
    () => HARDCODED_TRANSACTION_COUNT,
    () => true,
  )
}
