import { useMemo } from 'react'

import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

const widgetTypeMap: Record<TradeType, string> = {
  [TradeType.SWAP]: 'SWAP',
  [TradeType.LIMIT_ORDER]: 'LIMIT',
  // TODO: set different type for other advanced orders
  [TradeType.ADVANCED_ORDERS]: 'TWAP',
}

/**\
 *
 * Hook that returns "market" dimension in a form of
 * ${sellSymbol},${buySymbol}::${widgetType} or null
 *
 **/
export function useGetMarketDimension() {
  const tradeTypeInfo = useTradeTypeInfo()
  const derivedTradeState = useDerivedTradeState()

  const sellSymbol = derivedTradeState?.state?.inputCurrency?.symbol
  const buySymbol = derivedTradeState?.state?.outputCurrency?.symbol
  const tradePair = sellSymbol && buySymbol ? `${sellSymbol},${buySymbol}` : null

  return useMemo(() => {
    if (!tradeTypeInfo || !tradePair) {
      return null
    }

    return `${tradePair}::${widgetTypeMap[tradeTypeInfo.tradeType]}`
  }, [tradePair, tradeTypeInfo])
}
