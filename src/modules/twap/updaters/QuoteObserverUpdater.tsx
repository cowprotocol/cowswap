import { useMemo } from 'react'

import { Field } from 'legacy/state/swap/actions'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { useTradeQuote } from 'modules/tradeQuote'

export function QuoteObserverUpdater() {
  const { state } = useDerivedTradeState()
  const { response } = useTradeQuote()

  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const outputCurrency = state?.outputCurrency

  useMemo(() => {
    if (!outputCurrency || !response) {
      return
    }

    const value = response.quote.buyAmount

    updateCurrencyAmount({
      amount: { isTyped: false, value },
      currency: outputCurrency,
      field: Field.OUTPUT,
    })
  }, [outputCurrency, response, updateCurrencyAmount])

  return null
}
