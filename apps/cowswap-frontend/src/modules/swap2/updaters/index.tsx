import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupSwapAmountsFromUrlUpdater } from './SetupSwapAmountsFromUrlUpdater'

import { useFillSwapDerivedState, useSwapDerivedState } from '../hooks/useSwapDerivedState'

export function SwapUpdaters() {
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()

  useFillSwapDerivedState()
  useSetTradeQuoteParams(isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount, orderKind, true)

  return (
    <>
      <SetupSwapAmountsFromUrlUpdater />
      <QuoteObserverUpdater />
      <AppDataUpdater orderClass="market" slippageBips={percentToBps(INITIAL_ALLOWED_SLIPPAGE_PERCENT)} />
    </>
  )
}
