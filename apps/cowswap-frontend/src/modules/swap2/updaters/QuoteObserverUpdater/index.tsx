import { useEffect } from 'react'

import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'

import { useReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useUpdateSwapRawState } from '../../hooks/useUpdateSwapRawState'

export function QuoteObserverUpdater() {
  const state = useDerivedTradeState()
  const receiveAmountInfo = useReceiveAmountInfo()
  const updateSwapState = useUpdateSwapRawState()
  const tradeQuote = useTradeQuote()

  /**
   * Only when quote update because some params (input amount) changed
   */
  const isQuoteUpdating = tradeQuote.isLoading && tradeQuote.hasParamsChanged
  const { beforeNetworkCosts, isSell } = receiveAmountInfo || {}

  const amountToUpdate = isSell ? beforeNetworkCosts?.buyAmount : beforeNetworkCosts?.sellAmount

  const orderKind = state?.orderKind
  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  // Set the amount from quote response (receiveAmountInfo is a derived state from tradeQuote state)
  useSafeEffect(() => {
    if (!outputCurrency || !inputCurrency || !amountToUpdate) {
      return
    }

    const fieldToUpdate = isSell ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

    updateSwapState({
      [fieldToUpdate]: FractionUtils.serializeFractionToJSON(amountToUpdate),
    })
  }, [amountToUpdate, inputCurrency, outputCurrency, updateSwapState, isSell])

  /**
   * Reset the opposite field when the quote is updating
   */
  useEffect(() => {
    if (!isQuoteUpdating || !orderKind) return

    const fieldToReset = isSellOrder(orderKind) ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

    updateSwapState({
      [fieldToReset]: null,
    })
  }, [isQuoteUpdating, updateSwapState, orderKind])

  return null
}
