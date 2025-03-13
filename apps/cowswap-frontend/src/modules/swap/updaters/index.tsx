import { useEffect, useRef } from 'react'

import { useTradeTracking, TradeType, trackOrderStatusChanges } from '@cowprotocol/analytics'
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
 * Order Tracking Updater Component
 *
 * This component tracks order execution and failure events using GTM.
 * It monitors the order status and fires appropriate tracking events when orders
 * are executed or fail.
 */
function OrderTrackingUpdater({
  account,
  orders,
  activityItems,
}: {
  account: string | undefined
  orders: Record<string, any>
  activityItems: Array<{
    id: string
    status: ActivityStatus
    type: string
    orderType: string
  }>
}) {
  const tradeTracking = useTradeTracking()

  // Keep track of processed order IDs using refs
  const executedOrdersRef = useRef<Set<string>>(new Set())
  const failedOrdersRef = useRef<Set<string>>(new Set())

  // Track order execution and failures
  useEffect(() => {
    trackOrderStatusChanges(
      account,
      orders,
      activityItems,
      UiOrderType.SWAP,
      TradeType.SWAP,
      tradeTracking,
      executedOrdersRef,
      failedOrdersRef,
      'Swap execution failed',
    )
  }, [account, activityItems, orders, tradeTracking])

  return null
}

/**
 * Swap Updaters Component
 *
 * This component includes all updaters needed for the swap functionality:
 * - EthFlowDeadlineUpdater: Updates the deadline for ETH flow
 * - SetupSwapAmountsFromUrlUpdater: Sets up swap amounts from URL parameters
 * - QuoteObserverUpdater: Observes trade quotes
 * - OrderTrackingUpdater: Tracks order execution and failure events
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
    status: item.status, // Keep as enum value for type safety
    type: item.type,
    orderType: UiOrderType.SWAP,
  }))

  // Create a record of orders by ID for the OrderTrackingUpdater
  const ordersById = allOrders.reduce((acc: Record<string, any>, order: any) => {
    acc[order.id] = order
    return acc
  }, {})

  return (
    <>
      <EthFlowDeadlineUpdater deadlineState={swapDeadlineState} />
      <SetupSwapAmountsFromUrlUpdater />
      <QuoteObserverUpdater />

      {/* Order tracking for GTM analytics */}
      <OrderTrackingUpdater account={account} orders={ordersById} activityItems={activityItems} />

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
