import { PENDING_ORDERS_BUFFER } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

/**
 * An order is considered expired if it has been at least `PENDING_ORDERS_BUFFER` after `validTo`.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 *
 * Before `validTo`, an `expired` status is trusted as is: the backend can expire an order early
 * (e.g. a Solana sponsored order whose creation blockhash died), and no settlement race applies.
 */
export function isOrderExpired(
  order: Pick<EnrichedOrder, 'validTo'> & { status?: string },
  threshold = PENDING_ORDERS_BUFFER,
): boolean {
  const validToTime = order.validTo * 1000 // validTo is in seconds
  const now = Date.now()

  if (order.status === OrderStatus.EXPIRED && now < validToTime) return true

  return now - validToTime > threshold
}
