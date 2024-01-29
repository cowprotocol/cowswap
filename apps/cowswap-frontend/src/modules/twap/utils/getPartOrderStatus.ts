import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'
import { isOrderExpired, isOrderFulfilled, isTwapOrderCancelled } from 'legacy/state/orders/utils'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export function getPartOrderStatus(
  enrichedOrder: EnrichedOrder,
  parent: TwapOrderItem,
  isVirtualPart: boolean
): OrderStatus {
  const isExpired = isOrderExpired(enrichedOrder, 0)
  const isCancelled = isTwapOrderCancelled(enrichedOrder)

  // If parent is fulfilled, all parts are fulfilled
  if (parent.status === TwapOrderStatus.Fulfilled) return OrderStatus.FULFILLED

  if (isOrderFulfilled(enrichedOrder)) return OrderStatus.FULFILLED

  if (parent.status === TwapOrderStatus.Cancelled) {
    if (isExpired && !isCancelled) {
      return OrderStatus.EXPIRED
    }

    return OrderStatus.CANCELLED
  }
  if (isCancelled) return OrderStatus.CANCELLED

  if (parent.status === TwapOrderStatus.Expired) return OrderStatus.EXPIRED
  if (isExpired) return OrderStatus.EXPIRED

  if (isVirtualPart) return OrderStatus.SCHEDULED

  return OrderStatus.PENDING
}
