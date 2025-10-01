import { ReactNode } from 'react'

import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { useIsHooksTradeType } from 'modules/trade'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupSwapAmountsFromUrlUpdater } from './SetupSwapAmountsFromUrlUpdater'

import { useFillSwapDerivedState, useSwapDerivedState } from '../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../hooks/useSwapSettings'

// update last 10 pending swap orders
const PENDING_ORDERS_PAGE_SIZE = 10

// swap page doesn't have tabs
const IS_SWAP_PAGE = true

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
      <UnfillableOrdersUpdater pageSize={PENDING_ORDERS_PAGE_SIZE} isTabWithPending={IS_SWAP_PAGE} />
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
