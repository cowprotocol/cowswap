import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export enum TwapOrderStatusValues {
  CANCELLED,
  SCHEDULED,
  FILLED,
  EXPIRED,
  PARTIALLY_FILLED,
}

export function getTwapOrderStatus(childOrders: ParsedOrder[], orderStatus: OrderStatus): TwapOrderStatusValues | null {
  const areAllChildOrdersCancelled = childOrders.every((order) => order.status === OrderStatus.CANCELLED)

  // Second priority: Check for cancelled state
  if (areAllChildOrdersCancelled) {
    return TwapOrderStatusValues.CANCELLED
  }

  // Third priority: Check for scheduled orders
  const hasScheduledOrder = childOrders.some((childOrder) => childOrder.status === OrderStatus.SCHEDULED)

  if (hasScheduledOrder) {
    return TwapOrderStatusValues.SCHEDULED
  }

  // Fourth priority: Check for filled states
  const allChildrenFilled = childOrders.every(
    (childOrder) =>
      childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) >= 99.99,
  )

  if (allChildrenFilled) {
    return TwapOrderStatusValues.FILLED
  }

  const hasFilledOrders = childOrders.some(
    (childOrder) =>
      childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) > 0,
  )

  if (hasFilledOrders) {
    return TwapOrderStatusValues.PARTIALLY_FILLED
  }

  // Fifth priority: Check for expired state
  const allChildrenExpired = childOrders.every((childOrder) => childOrder.status === OrderStatus.EXPIRED)

  if (allChildrenExpired || orderStatus === OrderStatus.EXPIRED) {
    return TwapOrderStatusValues.EXPIRED
  }

  return null
}
