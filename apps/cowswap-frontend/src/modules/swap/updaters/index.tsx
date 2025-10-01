import { ReactNode } from 'react'

import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { useIsHooksTradeType } from 'modules/trade'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupSwapAmountsFromUrlUpdater } from './SetupSwapAmountsFromUrlUpdater'
import { UnfillableSwapOrdersUpdater } from './UnfillableSwapOrdersUpdater'

import { useFillSwapDerivedState, useSwapDerivedState } from '../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../hooks/useSwapSettings'

export function SwapUpdaters(): ReactNode {
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount, slippage } = useSwapDerivedState()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const swapDeadlineState = useSwapDeadlineState()
  const partiallyFillable = useIsHooksTradeType()

  useFillSwapDerivedState()
  useSetTradeQuoteParams({
    amount: isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount,
    partiallyFillable,
    fastQuote: true,
  })

  return (
    <>
      <UnfillableSwapOrdersUpdater />
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
