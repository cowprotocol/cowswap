import { UiOrderType } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'

import { TradeType } from '../types'

export const TradeTypeToUiOrderType: Record<TradeType, UiOrderType> = {
  [TradeType.SWAP]: UiOrderType.SWAP,
  [TradeType.LIMIT_ORDER]: UiOrderType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: UiOrderType.TWAP,
  [TradeType.YIELD]: UiOrderType.YIELD,
}

export interface OrdersTableSettings {
  [key: string]: { title: string; tooltip: string }
}

export function useOrdersTableSettings(): OrdersTableSettings {
  return {
    LEFT_ALIGNED: {
      title: t`Desktop: Left-Aligned Orders Table`,
      tooltip: t`When enabled, the orders table will be displayed on the left side on desktop screens. On mobile, the orders table will always be stacked below.`,
    },
  } as const
}
