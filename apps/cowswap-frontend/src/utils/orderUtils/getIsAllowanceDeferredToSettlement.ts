/**
 * A sponsored Solana order's SPL delegation sits in the bundle the order book only submits once a
 * solver wins, so no delegation exists on chain while the order waits.
 */
export function getIsAllowanceDeferredToSettlement(order: { isSponsored?: boolean }): boolean {
  return order.isSponsored === true
}
