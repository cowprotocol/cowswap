/**
 * This component wraps swap and trade screens to provide standardized
 * tracking functionality using GTM.
 */

import { useEffect } from 'react'

import { useTradeTracking, TradeType, TradeTrackingEventType } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSwapDerivedState } from '../hooks/useSwapDerivedState'

interface TradeTrackingWrapperProps {
  children: React.ReactNode
  pageView: string
  tradeType?: TradeType // Default to 'swap' if not provided
}

/**
 * This component handles tracking for all trade-related events:
 * - page_view: When user lands on the swap page
 * - wallet_connected: When user connects their wallet
 * - token_selected: When user selects tokens for swapping
 * - order_submitted, order_executed, order_failed: Handled in their respective components
 *
 * Note: Order submission, execution, and failure events are handled in the SwapConfirmModal
 * and TradeFlowTrackingUpdater components.
 */
export function TradeTrackingWrapper({ children, pageView }: TradeTrackingWrapperProps) {
  const { account } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useSwapDerivedState()
  const tradeTracking = useTradeTracking()

  // Track page view when component mounts
  useEffect(() => {
    tradeTracking.onPageView(pageView)
    console.info(`[Analytics] Tracked ${TradeTrackingEventType.PAGE_VIEW} event: ${pageView}`)
  }, [tradeTracking, pageView])

  // Track wallet connection when account changes
  useEffect(() => {
    if (account) {
      tradeTracking.onWalletConnected(account)
      console.info(`[Analytics] Tracked ${TradeTrackingEventType.WALLET_CONNECTED} event: ${account}`)
    }
  }, [tradeTracking, account])

  // Track token selection when currencies change
  useEffect(() => {
    if (!account) return

    if (inputCurrency) {
      tradeTracking.onTokenSelected(account, 'input', inputCurrency)
      console.info(
        `[Analytics] Tracked ${TradeTrackingEventType.TOKEN_SELECTED} event: ${inputCurrency.symbol} (input)`,
      )
    }

    if (outputCurrency) {
      tradeTracking.onTokenSelected(account, 'output', outputCurrency)
      console.info(
        `[Analytics] Tracked ${TradeTrackingEventType.TOKEN_SELECTED} event: ${outputCurrency.symbol} (output)`,
      )
    }
  }, [tradeTracking, account, inputCurrency, outputCurrency])

  return <>{children}</>
}
