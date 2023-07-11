import { useMemo } from 'react'

import { useTradePriceImpact } from 'modules/trade'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'

export interface TwapWarningsContext {
  canTrade: boolean
  showPriceImpactWarning: boolean
  walletIsNotConnected: boolean
}

export function useTwapWarningsContext(): TwapWarningsContext {
  const primaryFormValidation = useGetTradeFormValidation()
  const priceImpact = useTradePriceImpact()

  return useMemo(() => {
    // TODO: bind to settings
    const expertMode = false
    const canTrade = !primaryFormValidation || primaryFormValidation >= TradeFormValidation.ExpertApproveAndSwap
    const showPriceImpactWarning = canTrade && !expertMode && !!priceImpact.error
    const walletIsNotConnected = primaryFormValidation === TradeFormValidation.WalletNotConnected

    return {
      canTrade,
      showPriceImpactWarning,
      walletIsNotConnected,
    }
  }, [priceImpact, primaryFormValidation])
}
