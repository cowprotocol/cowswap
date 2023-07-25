import { TradeDerivedState, TradeType, TradeTypeInfo } from 'modules/trade'

type GetMarketDimensionParams = {
  tradeTypeInfo: TradeTypeInfo | null
  derivedTradeState: { state?: TradeDerivedState | undefined }
}

/**
 * Util function that takes tradeTypeInfo and derivedTradeState
 * and returns "market" dimension in a form of `${sellSymbol},${buySymbol}::${widgetType}`
 *
 */
export function getMarketDimension({ tradeTypeInfo, derivedTradeState }: GetMarketDimensionParams) {
  const params = { widgetType: '', market: '' }

  if (!tradeTypeInfo || !derivedTradeState || !derivedTradeState.state) {
    return ''
  }

  if (tradeTypeInfo.tradeType === TradeType.SWAP) {
    params.widgetType = 'SWAP'
  } else if (tradeTypeInfo.tradeType === TradeType.LIMIT_ORDER) {
    params.widgetType = 'LIMIT'
  } else if (tradeTypeInfo.tradeType === TradeType.ADVANCED_ORDERS) {
    params.widgetType = 'TWAP'
  }

  const sellSymbol = derivedTradeState.state.inputCurrency?.symbol
  const buySymbol = derivedTradeState.state.outputCurrency?.symbol
  params.market = `${sellSymbol},${buySymbol}`

  return `${params.market}::${params.widgetType}`
}
