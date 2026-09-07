import { TradeType as WidgetTradeType } from '@cowprotocol/widget-lib'

export const TRADE_URL_SELL_AMOUNT_KEY = 'sellAmount'
export const TRADE_URL_BUY_AMOUNT_KEY = 'buyAmount'
export const TRADE_URL_ORDER_KIND_KEY = 'orderKind'

export enum TradeType {
  SWAP = 'SWAP',
  LIMIT_ORDER = 'LIMIT_ORDER',
  ADVANCED_ORDERS = 'ADVANCED_ORDERS',
  YIELD = 'YIELD',
}

export const TradeTypeToWidgetTradeTypeMap: Record<TradeType, WidgetTradeType> = {
  [TradeType.SWAP]: WidgetTradeType.SWAP,
  [TradeType.LIMIT_ORDER]: WidgetTradeType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: WidgetTradeType.ADVANCED,
  [TradeType.YIELD]: WidgetTradeType.YIELD,
}
