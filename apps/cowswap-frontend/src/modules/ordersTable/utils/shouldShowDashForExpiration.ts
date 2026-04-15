import { OrderStatus } from 'legacy/state/orders/actions'

import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function shouldShowDashForExpiration(order: ParsedOrder): boolean {
  // Show dash for finalized orders that are not expired
  if (getIsFinalizedOrder(order) && order.status !== OrderStatus.EXPIRED) {
    return true
  }

  // For TWAP parent orders, show dash when all child orders are in a final state
  if (getIsComposableCowParentOrder(order)) {
    // If the parent order is fulfilled or cancelled, all child orders are finalized
    if (order.status === OrderStatus.FULFILLED || order.status === OrderStatus.CANCELLED) {
      return true
    }

    // For mixed states (some filled, some expired), check either condition:
    // 1. fullyFilled: true when all non-expired parts are filled
    // 2. status === EXPIRED: true when all remaining parts are expired
    // Either condition indicates all child orders are in a final state
    if (order.executionData.fullyFilled || order.status === OrderStatus.EXPIRED) {
      return true
    }
  }

  return false
}
