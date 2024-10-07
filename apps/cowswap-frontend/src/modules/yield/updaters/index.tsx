import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'

import { useFillYieldDerivedState, useYieldDerivedState } from '../hooks/useYieldDerivedState'

export function YieldUpdaters() {
  const { inputCurrencyAmount } = useYieldDerivedState()

  useFillYieldDerivedState()
  useSetTradeQuoteParams(inputCurrencyAmount, true)

  return (
    <>
      <QuoteObserverUpdater />
    </>
  )
}
