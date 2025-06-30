import { TradeType as WidgetTradeType } from '@cowprotocol/widget-lib'

import { TradeType } from '../trade'

export const PARTNER_FEE_MAX_BPS = 100 // 1%

export const TradeTypeMap: Record<TradeType, WidgetTradeType> = {
  [TradeType.SWAP]: WidgetTradeType.SWAP,
  [TradeType.LIMIT_ORDER]: WidgetTradeType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: WidgetTradeType.ADVANCED,
  [TradeType.YIELD]: WidgetTradeType.YIELD,
}
