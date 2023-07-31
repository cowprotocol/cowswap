import { useMemo } from 'react'

import { useTradePriceImpact } from '../../trade'
import { TradeFormValidation, useGetTradeFormValidation } from '../../tradeFormValidation'
import { useWalletInfo } from '../../wallet'

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
  const { account } = useWalletInfo()
  const primaryFormValidation = useGetTradeFormValidation()
  const priceImpact = useTradePriceImpact()

  return useMemo(() => {
    // TODO: bind to settings
    const expertMode = false
    const canTrade = !primaryFormValidation || NOT_BLOCKING_VALIDATIONS.includes(primaryFormValidation)
    const showPriceImpactWarning = canTrade && !expertMode && !!priceImpact.error
    const walletIsNotConnected = !account

    return {
      canTrade,
      showPriceImpactWarning,
      walletIsNotConnected,
    }
  }, [priceImpact, primaryFormValidation, account])
}
