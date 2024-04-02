import { CONFIRMED_STATES, OrderStatus } from 'legacy/state/orders/actions'

export function getIsFinalizedOrder(order: { status: OrderStatus; replacementType?: string }): boolean {
  return order.replacementType === 'replaced' || CONFIRMED_STATES.includes(order.status)
}
