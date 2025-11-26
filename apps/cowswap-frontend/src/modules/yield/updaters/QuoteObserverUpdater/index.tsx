import { useEffect, useLayoutEffect } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useDerivedTradeState, useGetReceiveAmountInfo } from 'modules/trade'

import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'

export function QuoteObserverUpdater(): null {
  const state = useDerivedTradeState()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { beforeAllFees } = receiveAmountInfo || {}

  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  // Set the output amount from quote response (receiveAmountInfo is a derived state from tradeQuote state)
  useLayoutEffect(() => {
    if (!outputCurrency || !inputCurrency || !beforeAllFees?.buyAmount) {
      return
    }

    updateCurrencyAmount(Field.OUTPUT, beforeAllFees.buyAmount)
  }, [beforeAllFees, inputCurrency, outputCurrency, updateCurrencyAmount])

  // Reset the output amount when the input amount changes
  useEffect(() => {
    if (!outputCurrency) {
      return
    }

    updateCurrencyAmount(Field.OUTPUT, CurrencyAmount.fromRawAmount(outputCurrency, 0))
  }, [state?.inputCurrencyAmount, state?.inputCurrency, updateCurrencyAmount, outputCurrency])

  return null
}
