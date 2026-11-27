import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

/** Long enough to cover signing, confirmation and the node catching up; short enough to stay a blip. */
const PLACEMENT_GRACE_PERIOD = ms`10s`

/**
 * A self-paid Solana order is funded by the very transaction that places it — the wrap, the delegation
 * and the order all land together. For a short window afterwards the cached snapshot still predates
 * that transaction, and the node may not serve the new state the instant it confirms, so the funding
 * checks have nothing truthful to say. Sponsored orders are excluded: their funding is deferred to
 * settlement and already handled, with no window to wait out.
 */
export function getIsWithinPlacementGrace(
  chainId: SupportedChainId,
  order: { isSponsored?: boolean; creationTime?: string | Date },
): boolean {
  if (!isSolanaChain(chainId) || order.isSponsored === true || !order.creationTime) return false

  const placedAt = new Date(order.creationTime).getTime()

  if (Number.isNaN(placedAt)) return false

  return Date.now() - placedAt < PLACEMENT_GRACE_PERIOD
}
