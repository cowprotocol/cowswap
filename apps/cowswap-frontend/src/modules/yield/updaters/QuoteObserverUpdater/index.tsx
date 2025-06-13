import { useEffect, useLayoutEffect } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'

import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function QuoteObserverUpdater() {
  const state = useDerivedTradeState()
  const receiveAmountInfo = useReceiveAmountInfo()
  const { beforeNetworkCosts } = receiveAmountInfo || {}

  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  // Set the output amount from quote response (receiveAmountInfo is a derived state from tradeQuote state)
  useLayoutEffect(() => {
    if (!outputCurrency || !inputCurrency || !beforeNetworkCosts?.buyAmount) {
      return
    }

    updateCurrencyAmount(Field.OUTPUT, beforeNetworkCosts.buyAmount)
  }, [beforeNetworkCosts, inputCurrency, outputCurrency, updateCurrencyAmount])

  // Reset the output amount when the input amount changes
  useEffect(() => {
    if (!outputCurrency) {
      return
    }

    updateCurrencyAmount(Field.OUTPUT, CurrencyAmount.fromRawAmount(outputCurrency, 0))
  }, [state?.inputCurrencyAmount, state?.inputCurrency, updateCurrencyAmount, outputCurrency])

  return null
}
