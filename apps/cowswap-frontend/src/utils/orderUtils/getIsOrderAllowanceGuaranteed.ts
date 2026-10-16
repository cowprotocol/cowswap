import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Whether a pending order's sell allowance is granted by the order's own lifecycle rather than by a
 * separate user action, so the cached allowance snapshot must not drive an unfillable warning.
 *
 * On Solana both order flows satisfy this. A sponsored order's SPL delegation sits in the bundle the
 * order book only submits once a solver wins, so no delegation exists on chain while the order waits.
 * An on-chain order carries its delegation in the very transaction that created it — `sendSolanaFlow`
 * sends every step as one transaction — so an order that exists at all was delegated atomically with
 * it, even though the snapshot taken before placement still reads zero. Neither case is actionable:
 * Solana has no separate approve flow for the user to run.
 */
export function getIsOrderAllowanceGuaranteed(chainId: SupportedChainId, order: { isSponsored?: boolean }): boolean {
  return isSolanaChain(chainId) || order.isSponsored === true
}
