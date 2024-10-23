import { UiOrderType } from '@cowprotocol/types'

import { TradeType } from '../types'

export const TradeTypeToUiOrderType: Record<TradeType, UiOrderType> = {
  [TradeType.SWAP]: UiOrderType.SWAP,
  [TradeType.LIMIT_ORDER]: UiOrderType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: UiOrderType.TWAP,
  [TradeType.YIELD]: UiOrderType.YIELD,
}
