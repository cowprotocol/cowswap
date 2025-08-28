import { UiOrderType } from '@cowprotocol/types'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

import { TradeType } from '../types'

export const TradeTypeToUiOrderType: Record<TradeType, UiOrderType> = {
  [TradeType.SWAP]: UiOrderType.SWAP,
  [TradeType.LIMIT_ORDER]: UiOrderType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: UiOrderType.TWAP,
  [TradeType.YIELD]: UiOrderType.YIELD,
}

export interface OrdersTableSettings {
  [key: string]: { title: MessageDescriptor; tooltip: MessageDescriptor }
}

export function getOrdersTableSettings(): OrdersTableSettings {
  return {
    LEFT_ALIGNED: {
      title: msg`Desktop: Left-Aligned Orders Table`,
      tooltip: msg`When enabled, the orders table will be displayed on the left side on desktop screens. On mobile, the orders table will always be stacked below.`,
    },
  } as const
}
