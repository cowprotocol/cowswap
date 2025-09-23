import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'

import { useLocation } from 'react-router'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from 'modules/ordersTable'
import { parseOrdersTableUrl } from 'modules/ordersTable/utils/parseOrdersTableUrl'
import { useIsHooksTradeType } from 'modules/trade'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'

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

  const location = useLocation()
  const isWindowVisible = useIsWindowVisible()

  const { pageNumber, tabId } = parseOrdersTableUrl(location.search)
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
        pageSize={ORDERS_TABLE_PAGE_SIZE}
        pageNumber={pageNumber}
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
