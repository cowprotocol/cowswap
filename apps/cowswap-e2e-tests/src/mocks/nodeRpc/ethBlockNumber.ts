import { mockRpcNodeRequest } from '../../support/mockRpcNodeRequest'

import type { BrowserContext } from '@playwright/test'

// An arbitrary-but-real mainnet block number, captured once — nothing in this suite asserts on the
// actual value, so a fixed one is enough to remove the real dependency entirely.
const HARDCODED_BLOCK_NUMBER = '0x188bc6f'

/**
 * `eth_blockNumber` goes out as a single, standalone JSON-RPC call (no Multicall3 batching, same
 * as `eth_getCode`) to whichever real RPC/Infura endpoint the app's own independent client picked.
 * Traced with `logUnmockedRpcRequests`/`LOG_UNMOCKED_RPC=1`: same class of real, rate-limited
 * dependency as `eth_getCode` (`installEthGetCode`) that 429s under `pnpm e2e`'s full parallel
 * load.
 */
export function installEthBlockNumber(context: BrowserContext): void {
  // No other mock watches `eth_blockNumber`, so every call with this method is unambiguously ours.
  mockRpcNodeRequest(
    context,
    'eth_blockNumber',
    () => HARDCODED_BLOCK_NUMBER,
    () => true,
  )
}
