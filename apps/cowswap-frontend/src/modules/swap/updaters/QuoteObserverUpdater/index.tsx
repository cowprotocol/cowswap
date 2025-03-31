import { useEffect } from 'react'

import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'

import { useReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useUpdateSwapRawState } from '../../hooks/useUpdateSwapRawState'
import { areFractionsTruthyAndDifferent } from '../../utils/areFractionsTruthyAndDifferent'

export function QuoteObserverUpdater() {
  const state = useDerivedTradeState()
  const receiveAmountInfo = useReceiveAmountInfo()
  const updateSwapState = useUpdateSwapRawState()
  const tradeQuote = useTradeQuote()

  /**
   * Only when quote update because some params (input amount) changed
   */
  const hasQuoteError = !!tradeQuote.error
  const isQuoteUpdating = tradeQuote.isLoading && tradeQuote.hasParamsChanged
  const { beforeNetworkCosts, afterSlippage, isSell } = receiveAmountInfo || {}

  const amountToUpdate = isSell ? beforeNetworkCosts?.buyAmount : beforeNetworkCosts?.sellAmount

  const orderKind = state?.orderKind

  const quoteSellAmount = isSell ? afterSlippage?.sellAmount : beforeNetworkCosts?.sellAmount
  const quoteBuyAmount = !isSell ? afterSlippage?.buyAmount : beforeNetworkCosts?.buyAmount

  const sellAmountMismatch = areFractionsTruthyAndDifferent(state?.inputCurrencyAmount, quoteSellAmount)
  const buyAmountMismatch = areFractionsTruthyAndDifferent(state?.outputCurrencyAmount, quoteBuyAmount)

  /**
   * In order to avoid race conditions
   * Make sure that `state` and `receiveAmountInfo` are in sync
   * Because there might be a race condition, when `state` is changed and `receiveAmountInfo` is not yet
   */
  const areAmountsChanged = sellAmountMismatch || buyAmountMismatch

  // Set the amount from quote response (receiveAmountInfo is a derived state from tradeQuote state)
  // Important! Do not remove isQuoteUpdating check, otherwise the amount won't be updated after resetting
  useSafeEffect(() => {
    if (!amountToUpdate || isQuoteUpdating || areAmountsChanged) return

    const fieldToUpdate = isSell ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

    updateSwapState({
      [fieldToUpdate]: FractionUtils.serializeFractionToJSON(amountToUpdate),
    })
  }, [amountToUpdate, updateSwapState, isSell, isQuoteUpdating, areAmountsChanged])

  /**
   * Reset the opposite field when the quote is updating
   */
  useEffect(() => {
    // Reset the opposite field when the quote is updating or has an error
    if ((!hasQuoteError && !isQuoteUpdating) || !orderKind) return

    const fieldToReset = isSellOrder(orderKind) ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

    updateSwapState({
      [fieldToReset]: null,
    })
  }, [isQuoteUpdating, hasQuoteError, updateSwapState, orderKind])

  return null
}
