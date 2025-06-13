import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { useIsHooksTradeType } from 'modules/trade'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupSwapAmountsFromUrlUpdater } from './SetupSwapAmountsFromUrlUpdater'

import { useFillSwapDerivedState, useSwapDerivedState } from '../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../hooks/useSwapSettings'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SwapUpdaters() {
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount, slippage } = useSwapDerivedState()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const swapDeadlineState = useSwapDeadlineState()
  const isHookTradeType = useIsHooksTradeType()
  const partiallyFillable = isHookTradeType

  useFillSwapDerivedState()
  useSetTradeQuoteParams({
    amount: isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount,
    partiallyFillable,
    fastQuote: true,
  })

  return (
    <>
      <EthFlowDeadlineUpdater deadlineState={swapDeadlineState} />
      <SetupSwapAmountsFromUrlUpdater />
      <QuoteObserverUpdater />
      {slippage && (
        <AppDataUpdater
          orderClass="market"
          slippageBips={percentToBps(slippage)}
          isSmartSlippage={isSmartSlippageApplied}
        />
      )}
    </>
  )
}
