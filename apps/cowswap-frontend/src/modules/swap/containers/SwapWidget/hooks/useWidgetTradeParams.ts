import { useMemo } from 'react'

import type { TradeWidgetProps as TradeWidgetComponentProps } from 'modules/trade'
import { useTradePriceImpact } from 'modules/trade'

import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'

export interface TradeWidgetParamsArgs {
  recipient: ReturnType<typeof useSwapDerivedState>['recipient']
  showRecipient: boolean
  isRateLoading: boolean
  priceImpact: ReturnType<typeof useTradePriceImpact>
}

export function useTradeWidgetParamsMemo({
  recipient,
  showRecipient,
  isRateLoading,
  priceImpact,
}: TradeWidgetParamsArgs): TradeWidgetComponentProps['params'] {
  return useMemo(
    () => ({
      compactView: true,
      enableSmartSlippage: true,
      isMarketOrderWidget: true,
      isSellingEthSupported: true,
      recipient,
      showRecipient,
      isTradePriceUpdating: isRateLoading,
      priceImpact,
    }),
    [recipient, showRecipient, isRateLoading, priceImpact],
  )
}
