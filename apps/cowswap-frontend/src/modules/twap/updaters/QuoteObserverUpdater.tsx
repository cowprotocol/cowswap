import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'

import { Field } from 'legacy/state/types'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { useTradeQuote } from 'modules/tradeQuote'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function QuoteObserverUpdater(): null {
  const state = useDerivedTradeState()
  const { quote, isLoading } = useTradeQuote()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const prevNumberOfParts = usePrevious(numberOfPartsValue)

  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const receiveAmountInfo = useGetReceiveAmountInfo()

  const outputCurrency = state?.outputCurrency
  const buyAmount = receiveAmountInfo?.beforeAllFees.buyAmount

  const quoteBuyAmount = useMemo(() => {
    const numOfPartsChanged = numberOfPartsValue !== prevNumberOfParts

    if (!buyAmount || !numberOfPartsValue || isLoading) {
      return null
    }

    if (numOfPartsChanged) {
      return null
    }

    const adjustedForParts = buyAmount.multiply(numberOfPartsValue)

    return adjustedForParts.quotient.toString()
  }, [isLoading, numberOfPartsValue, buyAmount, prevNumberOfParts])

  useEffect(() => {
    if (!outputCurrency || !quote || !quoteBuyAmount) {
      return
    }

    updateCurrencyAmount({
      amount: { isTyped: false, value: quoteBuyAmount },
      currency: outputCurrency,
      field: Field.OUTPUT,
    })
  }, [outputCurrency, quote, updateCurrencyAmount, quoteBuyAmount])

  return null
}
