import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

export function getIsLastPartOrder(item: TwapPartOrderItem, parent: TwapOrderItem): boolean {
  if (!parent.executedDate) return false

  const executedDate = new Date(parent.executedDate)
  const lastPartValidTo = Math.ceil(executedDate.getTime() / 1000) + parent.order.t * parent.order.n

  return item.order.validTo + 1 >= lastPartValidTo
}
