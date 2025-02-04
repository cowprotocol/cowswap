import { UiOrderType } from '@cowprotocol/types'

import { TradeType } from '../types'

export const TradeTypeToUiOrderType: Record<TradeType, UiOrderType> = {
  [TradeType.SWAP]: UiOrderType.SWAP,
  [TradeType.LIMIT_ORDER]: UiOrderType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: UiOrderType.TWAP,
  [TradeType.YIELD]: UiOrderType.YIELD,
}

export const ORDERS_TABLE_SETTINGS = {
  LEFT_ALIGNED: {
    title: 'Desktop: Left-Aligned Orders Table',
    tooltip:
      'When enabled, the orders table will be displayed on the left side on desktop screens. On mobile, the orders table will always be stacked below.',
  },
} as const
