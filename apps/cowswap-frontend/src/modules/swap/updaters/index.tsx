import { TradeFlowTrackingUpdater, SafaryTradeType } from '@cowprotocol/analytics'
import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ActivityStatus, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useOrders } from 'legacy/state/orders/hooks'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupSwapAmountsFromUrlUpdater } from './SetupSwapAmountsFromUrlUpdater'

import { useFillSwapDerivedState, useSwapDerivedState } from '../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../hooks/useSwapSettings'

/**
 * Swap Updaters Component
 *
 * This component includes all updaters needed for the swap functionality:
 * - EthFlowDeadlineUpdater: Updates the deadline for ETH flow
 * - SetupSwapAmountsFromUrlUpdater: Sets up swap amounts from URL parameters
 * - QuoteObserverUpdater: Observes trade quotes
 * - TradeFlowTrackingUpdater: Tracks all swap-related events for marketing analytics
 * - AppDataUpdater: Updates app data with slippage information
 */
export function SwapUpdaters() {
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount, slippage } = useSwapDerivedState()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const swapDeadlineState = useSwapDeadlineState()
  const { account, chainId } = useWalletInfo()

  useFillSwapDerivedState()
  useSetTradeQuoteParams(isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount, true)

  // Gather order data for tracking order execution and failures
  const allOrders = useOrders(chainId, account, UiOrderType.SWAP)
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()
  const allActivityIds = [...pendingActivity, ...confirmedActivity]
  const activityDescriptors = useMultipleActivityDescriptors({ chainId, ids: allActivityIds })

  // Map ActivityDescriptors to ActivityItemForTracking
  const activityItems = activityDescriptors.map((item) => ({
    id: item.id,
    status: String(item.status), // Convert ActivityStatus enum to string
    type: item.type,
    orderType: UiOrderType.SWAP, // All items are SWAP type in this context
  }))

  // Create a record of orders by ID for the TradeFlowTrackingUpdater
  const ordersById = allOrders.reduce((acc: Record<string, any>, order: any) => {
    acc[order.id] = order
    return acc
  }, {})

  return (
    <>
      <EthFlowDeadlineUpdater deadlineState={swapDeadlineState} />
      <SetupSwapAmountsFromUrlUpdater />
      <QuoteObserverUpdater />

      {/* Full trade flow tracking for Safary analytics */}
      <TradeFlowTrackingUpdater
        account={account}
        pageView="swap_page_view"
        orderType={UiOrderType.SWAP}
        tradeType={SafaryTradeType.SWAP_ORDER}
        ordersById={ordersById}
        activityItems={activityItems}
        statusConstants={{
          activityTypeName: 'order',
          fulfilledStatus: String(ActivityStatus.CONFIRMED),
          failedStatus: String(ActivityStatus.FAILED),
          orderFulfilledStatus: 'fulfilled',
          orderFailedStatus: 'failed',
        }}
        label="swap"
      />

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
