import { ReactNode } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'

import { useLocation } from 'react-router'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { OrderTabId } from 'modules/ordersTable'
import { parseOrdersTableUrl } from 'modules/ordersTable/utils/parseOrdersTableUrl'
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

export function SwapUpdaters(): ReactNode {
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount, slippage } = useSwapDerivedState()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const swapDeadlineState = useSwapDeadlineState()
  const isHookTradeType = useIsHooksTradeType()
  const partiallyFillable = isHookTradeType

  const location = useLocation()
  const isWindowVisible = useIsWindowVisible()

  const { tabId } = parseOrdersTableUrl(location.search)
  const isTabWithPending = tabId === OrderTabId.open || tabId === OrderTabId.all

  useFillSwapDerivedState()
  useSetTradeQuoteParams({
    amount: isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount,
    partiallyFillable,
    fastQuote: true,
  })

  return (
    <>
      <UnfillableOrdersUpdater
        pageSize={PENDING_ORDERS_PAGE_SIZE}
        isTabWithPending={isTabWithPending}
        isWindowVisible={isWindowVisible}
      />
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
