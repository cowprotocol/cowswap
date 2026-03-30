import { getIsComposableTwapCancellationOrder } from './getIsComposableTwapCancellationOrder'
import { CancellableOrder } from './isOrderCancellable'

export function getIsPrototypeTwapCancellationOrder(order: CancellableOrder): boolean {
  if (!order.composableCowInfo?.isPrototype) {
    return false
  }

  return getIsComposableTwapCancellationOrder(order)
}
