import { useMemo } from 'react'

import { useTradePriceImpact } from 'modules/trade'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'

const NOT_BLOCKING_VALIDATIONS = [
  TradeFormValidation.ExpertApproveAndSwap,
  TradeFormValidation.ApproveAndSwap,
  TradeFormValidation.ApproveRequired,
]

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
    const canTrade = !primaryFormValidation || NOT_BLOCKING_VALIDATIONS.includes(primaryFormValidation)
    const showPriceImpactWarning = canTrade && !expertMode && !!priceImpact.error
    const walletIsNotConnected = primaryFormValidation === TradeFormValidation.WalletNotConnected

    return {
      canTrade,
      showPriceImpactWarning,
      walletIsNotConnected,
    }
  }, [priceImpact, primaryFormValidation])
}
