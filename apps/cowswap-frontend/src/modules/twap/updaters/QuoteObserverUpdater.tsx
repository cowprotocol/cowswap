import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'

import { Field } from 'legacy/state/types'

import { useReceiveAmountInfo } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { useTradeQuote } from 'modules/tradeQuote'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function QuoteObserverUpdater() {
  const state = useDerivedTradeState()
  const { response, isLoading } = useTradeQuote()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const prevNumberOfParts = usePrevious(numberOfPartsValue)

  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const receiveAmountInfo = useReceiveAmountInfo()

  const outputCurrency = state?.outputCurrency
  const buyAmount = receiveAmountInfo?.beforeNetworkCosts.buyAmount

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
