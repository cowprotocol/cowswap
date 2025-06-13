import { useEffect } from 'react'

import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'

import { useReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useUpdateSwapRawState } from '../../hooks/useUpdateSwapRawState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  const { beforeNetworkCosts, isSell } = receiveAmountInfo || {}

  const amountToUpdate = isSell ? beforeNetworkCosts?.buyAmount : beforeNetworkCosts?.sellAmount

  const orderKind = state?.orderKind

  // Set the amount from quote response (receiveAmountInfo is a derived state from tradeQuote state)
  // Important! Do not remove isQuoteUpdating check, otherwise the amount won't be updated after resetting
  useSafeEffect(() => {
    if (!amountToUpdate || isQuoteUpdating) return

    const fieldToUpdate = isSell ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

    updateSwapState({
      [fieldToUpdate]: FractionUtils.serializeFractionToJSON(amountToUpdate),
    })
  }, [amountToUpdate, updateSwapState, isSell, isQuoteUpdating])

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
