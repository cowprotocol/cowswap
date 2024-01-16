import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

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

  const quoteBuyAmount = useMemo(() => {
    const numOfPartsChanged = numberOfPartsValue !== prevNumberOfParts

    if (!response || !outputCurrency || !numberOfPartsValue || isLoading) {
      return null
    }

    if (numOfPartsChanged) {
      return null
    }

    const { buyAmount } = response.quote
    const currencyValue = CurrencyAmount.fromRawAmount(outputCurrency, buyAmount)
    const adjustedForParts = currencyValue.multiply(numberOfPartsValue)

    return adjustedForParts.quotient.toString()
  }, [isLoading, numberOfPartsValue, outputCurrency, prevNumberOfParts, response])

  useMemo(() => {
    if (!outputCurrency || !response || !quoteBuyAmount) {
      return
    }

    updateCurrencyAmount({
      amount: { isTyped: false, value: quoteBuyAmount },
      currency: outputCurrency,
      field: Field.OUTPUT,
    })
  }, [outputCurrency, response, updateCurrencyAmount, quoteBuyAmount])

  return null
}
