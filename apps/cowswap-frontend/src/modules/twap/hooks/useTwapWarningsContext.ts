import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradePriceImpact } from 'modules/trade'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'

const NOT_BLOCKING_VALIDATIONS = [TradeFormValidation.ApproveAndSwap, TradeFormValidation.ApproveRequired]

export interface TwapWarningsContext {
  canTrade: boolean
  showPriceImpactWarning: boolean
  walletIsNotConnected: boolean
}

export function useTwapWarningsContext(): TwapWarningsContext {
  const { account } = useWalletInfo()
  const primaryFormValidation = useGetTradeFormValidation()
  const priceImpactParams = useTradePriceImpact()

  return useMemo(() => {
    const canTrade = !primaryFormValidation || NOT_BLOCKING_VALIDATIONS.includes(primaryFormValidation)
    const showPriceImpactWarning = canTrade && !priceImpactParams.loading && !priceImpactParams.priceImpact
    const walletIsNotConnected = !account

    return {
      canTrade,
      showPriceImpactWarning,
      walletIsNotConnected,
    }
  }, [primaryFormValidation, account, priceImpactParams])
}
