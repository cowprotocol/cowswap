import { TradeType, TradeTypeInfo } from 'modules/trade'

type GetMarketDimensionParams = {
  tradeTypeInfo: TradeTypeInfo | null
  tradePair: string | null
}

const widgetTypeMap: Record<TradeType, string> = {
  [TradeType.SWAP]: 'SWAP',
  [TradeType.LIMIT_ORDER]: 'LIMIT',
  // TODO: set different type for other advanced orders
  [TradeType.ADVANCED_ORDERS]: 'TWAP',
}

/**
 * Util function that takes tradeTypeInfo and tradePair
 * and returns "market" dimension in a form of `${sellSymbol},${buySymbol}::${widgetType}`
 * or null
 */
export function getMarketDimension({ tradeTypeInfo, tradePair }: GetMarketDimensionParams): string | null {
  if (!tradeTypeInfo || !tradePair) {
    return null
  }

  return `${tradePair}::${widgetTypeMap[tradeTypeInfo.tradeType]}`
}
