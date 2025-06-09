import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupYieldAmountsFromUrlUpdater } from './SetupYieldAmountsFromUrlUpdater'

import { useFillYieldDerivedState, useYieldDerivedState } from '../hooks/useYieldDerivedState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function YieldUpdaters() {
  const { inputCurrencyAmount } = useYieldDerivedState()

  useFillYieldDerivedState()
  useSetTradeQuoteParams({ amount: inputCurrencyAmount, partiallyFillable: false, fastQuote: true })

  return (
    <>
      <SetupYieldAmountsFromUrlUpdater />
      <QuoteObserverUpdater />
      <AppDataUpdater orderClass="market" slippageBips={percentToBps(INITIAL_ALLOWED_SLIPPAGE_PERCENT)} />
    </>
  )
}
