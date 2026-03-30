import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsTheLastTwapPart } from 'utils/orderUtils/getIsTheLastTwapPart'

import { CancellableOrder } from './isOrderCancellable'

export function getIsComposableTwapCancellationOrder(order: CancellableOrder): boolean {
  return getIsComposableCowParentOrder(order) || getIsTheLastTwapPart(order.composableCowInfo)
}
