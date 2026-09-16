import { encodeAbiParameters, toFunctionSelector } from 'viem'

import { mockContractViewCall } from '../../support/mockContractViewCall'

import type { BrowserContext } from '@playwright/test'

// No test in this suite asserts on the real on-chain nonce, only that one is present — a fixed
// value removes the real dependency entirely, same rationale as `installEthBlockNumber`.
const NONCE_RESULT = encodeAbiParameters([{ type: 'uint256' }], [1n])

/**
 * `eip2612Utils.getTokenNonce` (`@1inch/permit-signed-approvals-utils`'s `getTokenNonceByMethod`)
 * doesn't call a single, fixed method — it walks its own `ERC_20_NONCES_ABI` list in order
 * (`nonces`, `_nonces`, `nonce`, `getNonce` — the last one labeled "dai polygon" in its source),
 * `eth_call`ing each in turn and only moving to the next on failure. Mocking `nonces` alone left
 * every other variant unmocked, so any token whose probe reaches past it (observed for the
 * cross-chain sell token here, ending on `getNonce`) sends a real, host-agnostic `eth_call` this
 * suite doesn't control. On its own that's just a real dependency the CI runner's shared RPC key
 * can rate-limit — but when that unmocked call lands in the very same Multicall3 batch as another
 * mock's own call (`installSocketVerifier`'s `validateRotueId`, in [CS-310]'s case), the whole
 * batch falls back to a real upstream fetch, and a rate-limited response there silently swallows
 * the *other* mock's already-correct answer too (see `mockRpcNodeRequest.ts`'s `fulfillFromUpstream`
 * hardening). Mocking every variant the library can reach means the probe always resolves on its
 * first `eth_call`, so no cross-chain multicall needs a real fetch merged in at all.
 */
export function installTokenNonce(context: BrowserContext): void {
  for (const name of ['nonces', '_nonces', 'nonce', 'getNonce']) {
    mockContractViewCall(context, undefined, toFunctionSelector(`${name}(address)`), () => NONCE_RESULT)
  }
}
