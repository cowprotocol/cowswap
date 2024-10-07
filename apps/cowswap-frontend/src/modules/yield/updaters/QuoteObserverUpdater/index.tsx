import { useEffect, useLayoutEffect } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'

import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'

export function QuoteObserverUpdater() {
  const { response } = useTradeQuote()
  const state = useDerivedTradeState()

  const updateLimitRateState = useUpdateCurrencyAmount()

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  useLayoutEffect(() => {
    if (!outputCurrency || !inputCurrency || !response) {
      return
    }

    const { buyAmount: buyAmountRaw } = response.quote

    updateLimitRateState(Field.OUTPUT, CurrencyAmount.fromRawAmount(outputCurrency, buyAmountRaw))
  }, [response, inputCurrency, outputCurrency, updateLimitRateState])

  useEffect(() => {
    if (!outputCurrency) {
      return
    }

    updateLimitRateState(Field.OUTPUT, CurrencyAmount.fromRawAmount(outputCurrency, 0))
  }, [state?.inputCurrencyAmount, updateLimitRateState, outputCurrency])

  return null
}
