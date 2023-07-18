import { EnrichedOrder, OrderStatus as SdkOrderStatus } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'
import { isOrderCancelled, isOrderExpired, isOrderFulfilled } from 'legacy/state/orders/utils'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export function getPartOrderStatus(
  enrichedOrder: EnrichedOrder,
  parent: TwapOrderItem,
  isVirtualPart: boolean
): OrderStatus {
  if (parent.status === TwapOrderStatus.Fulfilled) return OrderStatus.FULFILLED
  if (isOrderFulfilled(enrichedOrder)) return OrderStatus.FULFILLED

  if (parent.status === TwapOrderStatus.Cancelled) return OrderStatus.CANCELLED
  if (isOrderCancelled(enrichedOrder) || enrichedOrder.status === SdkOrderStatus.CANCELLED) return OrderStatus.CANCELLED

  if (parent.status === TwapOrderStatus.Expired) return OrderStatus.EXPIRED
  if (isOrderExpired(enrichedOrder)) return OrderStatus.EXPIRED

  if (isVirtualPart) return OrderStatus.SCHEDULED

  return OrderStatus.PENDING
}
