import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
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
      <AppDataUpdater orderClass="market" slippageBips={percentToBps(INITIAL_ALLOWED_SLIPPAGE_PERCENT)} />
    </>
  )
}
