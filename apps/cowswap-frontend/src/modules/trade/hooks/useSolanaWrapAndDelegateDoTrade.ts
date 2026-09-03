import { useCallback, useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsHooksTradeType } from './useIsHooksTradeType'
import { useSolanaWrapAndDelegateCallback } from './useSolanaWrapAndDelegateCallback'
import { useTradeConfirmActions } from './useTradeConfirmActions'

import { solanaWrapAndDelegateFlow } from '../services/solanaFlow/solanaWrapAndDelegateFlow'

export interface DoTradeCallback {
  callback(): Promise<false | void>
  contextIsReady: boolean
}

// Returns null outside the Solana native-sell case, so callers fall back to the regular EVM trade flow.
export function useSolanaWrapAndDelegateDoTrade(): DoTradeCallback | null {
  const state = useDerivedTradeState()
  const isHooksStore = useIsHooksTradeType()
  const tradeConfirmActions = useTradeConfirmActions()

  const sellAmount = state?.inputCurrencyAmount ? BigInt(state.inputCurrencyAmount.quotient.toString()) : undefined
  const wrapAndDelegate = useSolanaWrapAndDelegateCallback(sellAmount)

  const isSolanaNativeSell =
    !isHooksStore &&
    !!state?.inputCurrency &&
    getIsNativeToken(state.inputCurrency) &&
    isSolanaChain(state.inputCurrency.chainId)

  const inputAmount = state?.inputCurrencyAmount
  const outputAmount = state?.outputCurrencyAmount

  const callback = useCallback(async (): Promise<false | void> => {
    if (!wrapAndDelegate || !inputAmount || !outputAmount) return false

    const success = await solanaWrapAndDelegateFlow({
      tradeConfirmActions,
      tradeAmounts: { inputAmount, outputAmount },
      wrapAndDelegate,
    })

    return success ? undefined : false
  }, [wrapAndDelegate, inputAmount, outputAmount, tradeConfirmActions])

  return useMemo(() => {
    if (!isSolanaNativeSell) return null

    return { callback, contextIsReady: !!wrapAndDelegate }
  }, [isSolanaNativeSell, callback, wrapAndDelegate])
}
