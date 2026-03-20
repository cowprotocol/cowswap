import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'
import { isOrderExpired, isOrderFulfilled, isTwapOrderCancelled } from 'legacy/state/orders/utils'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export function getPartOrderStatus(
  enrichedOrder: EnrichedOrder,
  parent: TwapOrderItem,
  isVirtualPart: boolean,
): OrderStatus {
  const isExpired = isOrderExpired(enrichedOrder, 0)
  const isCancelled = isTwapOrderCancelled(enrichedOrder)
  const parentDerivedStatus = getParentDerivedPartStatus(parent.status, isVirtualPart, isExpired, isCancelled)

  // If parent is fulfilled, all parts are fulfilled
  if (parent.status === TwapOrderStatus.Fulfilled) return OrderStatus.FULFILLED

  if (isOrderFulfilled(enrichedOrder)) return OrderStatus.FULFILLED

  if (parentDerivedStatus) return parentDerivedStatus
  if (isCancelled) return OrderStatus.CANCELLED

  if (parent.status === TwapOrderStatus.Expired) return OrderStatus.EXPIRED
  if (isExpired) return OrderStatus.EXPIRED

  if (isVirtualPart) return OrderStatus.SCHEDULED

  return OrderStatus.PENDING
}

function getParentDerivedPartStatus(
  parentStatus: TwapOrderStatus,
  isVirtualPart: boolean,
  isExpired: boolean,
  isCancelled: boolean,
): OrderStatus | null {
  if (parentStatus === TwapOrderStatus.Cancelled) {
    if (isExpired && !isCancelled) {
      return OrderStatus.EXPIRED
    }

    return OrderStatus.CANCELLED
  }

  if (parentStatus !== TwapOrderStatus.Cancelling) return null

  // Cancelling is an intermediate parent state. Keep child parts non-final so the UI can
  // render the cancelling badge instead of falling back to time-based "Expired".
  return isVirtualPart ? OrderStatus.SCHEDULED : OrderStatus.PENDING
}
