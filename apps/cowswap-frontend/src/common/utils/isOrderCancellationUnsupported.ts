import type { ComposableCowInfo } from 'common/types'
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsTheLastTwapPart } from 'utils/orderUtils/getIsTheLastTwapPart'

interface OrderCancellationMetadata {
  composableCowInfo?: ComposableCowInfo
  isEoaTwapOrder?: boolean
}

export function isOrderCancellationUnsupported(order: OrderCancellationMetadata): boolean {
  return (
    order.isEoaTwapOrder === true &&
    (getIsComposableCowParentOrder(order) || getIsTheLastTwapPart(order.composableCowInfo))
  )
}
