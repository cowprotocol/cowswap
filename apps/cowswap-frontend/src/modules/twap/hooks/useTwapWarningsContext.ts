import { useMemo } from 'react'

import { useWalletInfo } from '@cowswap/wallet'

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
  const { account } = useWalletInfo()
  const primaryFormValidation = useGetTradeFormValidation()

  return useMemo(() => {
    // TODO: bind to settings
    const expertMode = false
    const canTrade = !primaryFormValidation || NOT_BLOCKING_VALIDATIONS.includes(primaryFormValidation)
    const showPriceImpactWarning = canTrade && !expertMode
    const walletIsNotConnected = !account

    return {
      canTrade,
      showPriceImpactWarning,
      walletIsNotConnected,
    }
  }, [primaryFormValidation, account])
}
