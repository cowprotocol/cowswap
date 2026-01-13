import { FractionUtils } from '@cowprotocol/common-utils'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { useEstimatedBridgeBuyAmount } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useUpdateSwapRawState } from '../../hooks/useUpdateSwapRawState'

export function QuoteObserverUpdater(): null {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const updateSwapState = useUpdateSwapRawState()
  const tradeQuote = useTradeQuote()
  const { expectedToReceiveAmount } = useEstimatedBridgeBuyAmount() || {}

  /**
   * Only when quote update because some params (input amount) changed
   */
  const isQuoteUpdating = tradeQuote.isLoading && tradeQuote.hasParamsChanged
  const { beforeAllFees, isSell } = receiveAmountInfo || {}

  const amountToUpdate = expectedToReceiveAmount ?? (isSell ? beforeAllFees?.buyAmount : beforeAllFees?.sellAmount)

  // Set the amount from quote response (receiveAmountInfo is a derived state from tradeQuote state)
  // Important! Do not remove isQuoteUpdating check, otherwise the amount won't be updated after resetting
  useSafeEffect(() => {
    if (!amountToUpdate || isQuoteUpdating) return

    const fieldToUpdate = isSell ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

    updateSwapState({
      [fieldToUpdate]: FractionUtils.serializeFractionToJSON(amountToUpdate),
    })
  }, [amountToUpdate, updateSwapState, isSell, isQuoteUpdating])

  return null
}
