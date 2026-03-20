import { createPartOrderFromParent } from './buildTwapParts'

import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

export function resolveDisplayTwapPartOrder(item: TwapPartOrderItem, parent: TwapOrderItem): TwapPartOrderItem {
  if (!parent.isPrototype || !parent.prototypeSimulation?.partProgressMs) {
    return item
  }

  const resolvedOrder = createPartOrderFromParent(parent, item.index)

  if (!resolvedOrder) {
    return item
  }

  return {
    ...item,
    order: resolvedOrder,
  }
}
