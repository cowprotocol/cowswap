import { OrderStatus } from 'legacy/state/orders/actions'

/**
 * A still-open order (or open part) is effectively unfillable when the Safe's ComposableCoW
 * fallback handler has been reset/removed: watchtower can no longer pick it up (see issue #5426).
 *
 * The "fallback handler is broken" state is per-account (see `useIsFallbackHandlerRequired`), so it
 * is resolved in the view layer and combined here with the per-order status — it is intentionally
 * not persisted onto the order/state.
 */
export function getIsFallbackHandlerUnfillable(status: OrderStatus, isFallbackHandlerBroken: boolean): boolean {
  return isFallbackHandlerBroken && (status === OrderStatus.PENDING || status === OrderStatus.SCHEDULED)
}
