import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import usePrevious from 'legacy/hooks/usePrevious'
import { Field } from 'legacy/state/swap/actions'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { useTradeQuote } from 'modules/tradeQuote'

import { partsStateAtom } from '../state/partsStateAtom'

export function QuoteObserverUpdater() {
  const { state } = useDerivedTradeState()
  const { response, isLoading } = useTradeQuote()
  const { numberOfPartsValue } = useAtomValue(partsStateAtom)
  const prevNumberOfParts = usePrevious(numberOfPartsValue)

  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const outputCurrency = state?.outputCurrency

  const value = useMemo(() => {
    if (!response || !outputCurrency || !numberOfPartsValue || numberOfPartsValue !== prevNumberOfParts || isLoading) {
      return null
    }

    const value = response.quote.buyAmount
    const currencyValue = CurrencyAmount.fromRawAmount(outputCurrency, value)
    const adjustedForParts = currencyValue.multiply(numberOfPartsValue)

    return adjustedForParts.quotient.toString()
  }, [isLoading, numberOfPartsValue, outputCurrency, prevNumberOfParts, response])

  useMemo(() => {
    if (!outputCurrency || !response || !value) {
      return
    }

    updateCurrencyAmount({
      amount: { isTyped: false, value },
      currency: outputCurrency,
      field: Field.OUTPUT,
    })
  }, [outputCurrency, response, updateCurrencyAmount, value])

  return null
}
