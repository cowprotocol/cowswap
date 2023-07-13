import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'
import { isOrderExpired, isOrderFulfilled } from 'legacy/state/orders/utils'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export function getPartOrderStatus(
  enrichedOrder: EnrichedOrder,
  parent: TwapOrderItem,
  isVirtualPart: boolean
): OrderStatus {
  if (isOrderExpired(enrichedOrder)) return OrderStatus.EXPIRED
  if (isOrderFulfilled(enrichedOrder)) return OrderStatus.FULFILLED

  if (parent.status === TwapOrderStatus.Fulfilled) return OrderStatus.FULFILLED
  if (parent.status === TwapOrderStatus.Expired) return OrderStatus.EXPIRED
  if (parent.status === TwapOrderStatus.Cancelled) return OrderStatus.CANCELLED

  if (isVirtualPart) return OrderStatus.SCHEDULED

  return OrderStatus.PENDING
}
