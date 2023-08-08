import { CONFIRMED_STATES, OrderStatus } from 'legacy/state/orders/actions'

export function getIsFinalizedOrder(order: { status: OrderStatus }): boolean {
  return CONFIRMED_STATES.includes(order.status)
}
