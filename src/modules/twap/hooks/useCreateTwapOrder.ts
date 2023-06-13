import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeConfirmActions } from 'modules/trade'

import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import { settleTwapOrder } from '../services/settleTwapOrder'
import { twapOrderAtom } from '../state/twapOrderAtom'

export function useCreateTwapOrder() {
  const twapOrder = useAtomValue(twapOrderAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)

  const tradeConfirmActions = useTradeConfirmActions()

  return useCallback(async () => {
    if (!inputCurrencyAmount || !outputCurrencyAmount || !twapOrderCreationContext || !twapOrder) return

    const pendingTrade = {
      inputAmount: inputCurrencyAmount,
      outputAmount: outputCurrencyAmount,
    }

    const startTime = Math.round((Date.now() + ms`1m`) / 1000) // Now + 1 min

    tradeConfirmActions.onSign(pendingTrade)

    try {
      const { safeTxHash } = await settleTwapOrder({ ...twapOrder, startTime }, twapOrderCreationContext)

      tradeConfirmActions.onSuccess(safeTxHash)
    } catch (error) {
      tradeConfirmActions.onError(error.message || error)
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, twapOrder, tradeConfirmActions, twapOrderCreationContext])
}
