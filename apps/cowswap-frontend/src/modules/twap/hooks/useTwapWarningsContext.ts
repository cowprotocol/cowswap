import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { TradeFormValidation } from 'modules/tradeFormValidation/types'

const NOT_BLOCKING_VALIDATIONS = [TradeFormValidation.ApproveAndSwap, TradeFormValidation.ApproveRequired]

export interface TwapWarningsContext {
  canTrade: boolean
  walletIsNotConnected: boolean
}

export function useTwapWarningsContext(): TwapWarningsContext {
  const { account } = useWalletInfo()
  const primaryFormValidation = useGetTradeFormValidation()

  return useMemo(() => {
    const canTrade = !primaryFormValidation || NOT_BLOCKING_VALIDATIONS.includes(primaryFormValidation)
    const walletIsNotConnected = !account

    return {
      canTrade,
      walletIsNotConnected,
    }
  }, [primaryFormValidation, account])
}
