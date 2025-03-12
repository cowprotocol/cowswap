import { useEffect, useRef } from 'react'

import { useTradeTracking, TradeType, TradeTrackingEventType } from '@cowprotocol/analytics'
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
    status: string
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
    if (!account || !activityItems.length || !orders) return

    // Process only activity items for the SWAP order type
    activityItems.forEach((item) => {
      if (item.type !== 'order') return
      if (item.orderType !== UiOrderType.SWAP) return

      const order = orders[item.id]
      if (!order) return

      // Check for executed orders
      if (
        item.status === String(ActivityStatus.CONFIRMED) &&
        order.status === 'fulfilled' &&
        !executedOrdersRef.current.has(item.id) // Prevent duplicate tracking
      ) {
        // Get executed amounts - safely convert to numbers
        let fromAmount: number | undefined = undefined
        let toAmount: number | undefined = undefined

        try {
          if (order.sellAmount) {
            fromAmount = parseFloat(order.sellAmount.toString()) / 10 ** (order.inputToken?.decimals || 18)
          }

          if (order.buyAmount) {
            toAmount = parseFloat(order.buyAmount.toString()) / 10 ** (order.outputToken?.decimals || 18)
          }
        } catch (error) {
          console.error(`[Analytics] Error calculating swap amounts:`, error)
        }

        // Track order execution
        tradeTracking.onOrderExecuted({
          walletAddress: account,
          tradeType: TradeType.SWAP,
          fromAmount,
          fromCurrency: order.inputToken?.symbol || '',
          toAmount,
          toCurrency: order.outputToken?.symbol || '',
          contractAddress: order.inputToken?.address || '',
          transactionHash: order.fulfilledTransactionHash || order.id,
        })

        console.info(`[Analytics] Tracked ${TradeTrackingEventType.ORDER_EXECUTED} event for order ${item.id}`)

        // Mark order as tracked to prevent duplicate tracking
        executedOrdersRef.current.add(item.id)
      }

      // Check for failed orders
      if (
        item.status === String(ActivityStatus.FAILED) &&
        order.status === 'failed' &&
        !failedOrdersRef.current.has(item.id) // Prevent duplicate tracking
      ) {
        // Track order failure
        tradeTracking.onOrderFailed(
          {
            walletAddress: account,
            tradeType: TradeType.SWAP,
            fromCurrency: order.inputToken?.symbol || '',
            toCurrency: order.outputToken?.symbol || '',
            contractAddress: order.inputToken?.address || '',
          },
          'Swap execution failed',
        )

        console.info(`[Analytics] Tracked ${TradeTrackingEventType.ORDER_FAILED} event for order ${item.id}`)

        // Mark order as failure-tracked to prevent duplicate tracking
        failedOrdersRef.current.add(item.id)
      }
    })
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
    status: String(item.status), // Convert ActivityStatus enum to string
    type: item.type,
    orderType: UiOrderType.SWAP, // All items are SWAP type in this context
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
