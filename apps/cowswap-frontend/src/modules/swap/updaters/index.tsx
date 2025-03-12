import { BasicTradeFlowTrackingUpdater } from '@cowprotocol/analytics'
import { isSellOrder, percentToBps } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { AppDataUpdater } from 'modules/appData'
import { EthFlowDeadlineUpdater } from 'modules/ethFlow'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

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
 * - BasicTradeFlowTrackingUpdater: Tracks page views and wallet connections for analytics
 * - AppDataUpdater: Updates app data with slippage information
 */
export function SwapUpdaters() {
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount, slippage } = useSwapDerivedState()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const swapDeadlineState = useSwapDeadlineState()
  const { account } = useWalletInfo()

  useFillSwapDerivedState()
  useSetTradeQuoteParams(isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount, true)

  // To fully enable order execution tracking, you'll need to gather the order data
  // Uncomment and adjust these lines based on your project structure
  /*
  const orders = useAllOrders()
  const activityItems = useAllActivityItems() 
  
  // Create a record of orders by ID for the TradeFlowTrackingUpdater
  const ordersById = orders.reduce(
    (acc: Record<string, any>, order: any) => {
      acc[order.id] = order
      return acc
    }, 
    {}
  )
  */

  return (
    <>
      <EthFlowDeadlineUpdater deadlineState={swapDeadlineState} />
      <SetupSwapAmountsFromUrlUpdater />
      <QuoteObserverUpdater />

      {/* Track page views and wallet connections */}
      <BasicTradeFlowTrackingUpdater account={account} pageView="swap_page_view" />

      {/* 
        For full order tracking, you can replace the BasicTradeFlowTrackingUpdater above with:
        
        <TradeFlowTrackingUpdater 
          account={account} 
          pageView="swap_page_view"
          orderType="SWAP" // Your application order type
          tradeType={SafaryTradeType.SWAP_ORDER} // Safary trade type
          ordersById={ordersById}
          activityItems={activityItems}
          statusConstants={{
            activityTypeName: 'order',
            fulfilledStatus: 'fulfilled',
            failedStatus: 'failed',
            orderFulfilledStatus: 'fulfilled',
            orderFailedStatus: 'failed',
          }}
        />
      */}

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
