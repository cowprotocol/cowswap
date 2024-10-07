import { QuoteObserverUpdater } from './QuoteObserverUpdater'

import { useSetTradeQuoteParams } from '../../tradeQuote'
import { useFillYieldDerivedState, useYieldDerivedState } from '../hooks/useYieldDerivedState'

export function YieldUpdaters() {
  const { inputCurrencyAmount } = useYieldDerivedState()

  useFillYieldDerivedState()
  useSetTradeQuoteParams(inputCurrencyAmount)

  return (
    <>
      <QuoteObserverUpdater />
    </>
  )
}
