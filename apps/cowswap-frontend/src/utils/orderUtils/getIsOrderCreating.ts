import { OrderStatus } from 'legacy/state/orders/actions'

/**
 * The transaction that creates the order has not landed yet, so nothing the order needs is on chain —
 * the sell funds and the delegation both arrive with it. Judging such an order against the current
 * balance snapshot reports a shortfall that its own confirmation resolves.
 */
export function getIsOrderCreating(order: { status?: OrderStatus }): boolean {
  return order.status === OrderStatus.CREATING
}
