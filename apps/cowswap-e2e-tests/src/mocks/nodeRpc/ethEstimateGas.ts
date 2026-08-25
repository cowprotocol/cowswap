import { mockRpcNodeRequest } from '../../support/mockRpcNodeRequest'

import type { BrowserContext } from '@playwright/test'

/** A generous flat estimate — never actually spent, since whatever gets estimated (a `createOrder()`
 * call, a `permit()`-based approval, ...) is either stubbed itself or never sent for real. */
const FAKE_GAS_ESTIMATE = '0x7a120' as const

/**
 * Before sending almost any on-chain tx, the app estimates gas for it via its own default public
 * RPC — which, traced live, is *not* `REACT_APP_NETWORK_URL_{chainId}` at all (that only backs this
 * suite's own wallet-side dispatch/proxy) but whichever of the app's own hardcoded providers
 * (Infura, the WalletConnect RPC relay, ...) it happens to pick, unpredictable and outside this
 * test's control. Left unmocked, that's a REAL simulation against the wallet's REAL on-chain state
 * (e.g. zero balance, since this is a shared test key with no real funds) and either fails outright
 * or, under `pnpm e2e`'s full parallel load, 429s from the real, rate-limited host.
 *
 * Originally lived only inside `mockEthFlowTransaction` (for the ETH-flow `createOrder()` call
 * specifically), but tracing with `logUnmockedRpcRequests`/`LOG_UNMOCKED_RPC=1` found the exact
 * same `eth_estimateGas` calls, for an EIP-2612 `permit()` approval (`0xd505accf`), in tests that
 * never touch `mockEthFlowTransaction` at all — e.g. the cross-chain-to-Solana/Bitcoin tests. Since
 * every gas estimate this suite ever needs is fake regardless of what it's for, this is installed
 * unconditionally rather than only for ETH-flow tests. Matched host-agnostically by JSON-RPC method
 * (like `mocks/socketVerifier.ts`) rather than by URL, since there's no fixed host to route on.
 */
export function installEthEstimateGas(context: BrowserContext): void {
  // No other mock watches `eth_estimateGas`, so every call with this method is unambiguously ours.
  mockRpcNodeRequest(
    context,
    'eth_estimateGas',
    () => FAKE_GAS_ESTIMATE,
    () => true,
  )
}
