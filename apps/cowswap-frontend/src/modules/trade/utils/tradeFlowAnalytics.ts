import { Category, initGtm } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { USER_SWAP_REJECTED_ERROR } from 'modules/trade/utils/swapErrorHelper'

export interface TradeFlowAnalyticsContext {
  account: string | null
  recipient?: string | null
  recipientAddress?: string | null
  marketLabel?: string
  orderType: UiOrderType
}

// Get analytics instance
const analytics = initGtm()

// Helper to create consistent trade analytics events
const sendTradeAnalytics = (action: string, orderType: UiOrderType, marketLabel?: string, value?: number) => {
  analytics.sendEvent({
    category: Category.TRADE,
    action,
    label: `${orderType}|${marketLabel}`,
    ...(value !== undefined && { value }),
  })
}

export const tradeFlowAnalytics = {
  trade(context: TradeFlowAnalyticsContext) {
    sendTradeAnalytics('Send', context.orderType, context.marketLabel)
  },
  sign(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    sendTradeAnalytics('Sign', orderType, marketLabel)
  },
  approveAndPresign(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    sendTradeAnalytics('Bundle Approve and Swap', orderType, marketLabel)
  },
  placeAdvancedOrder(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    sendTradeAnalytics('Place Advanced Order', orderType, marketLabel)
  },
  wrapApproveAndPresign(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    sendTradeAnalytics('Bundled Eth Flow', orderType, marketLabel)
  },
  error(error: Error & { code?: number }, errorMessage: string, context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context

    if (errorMessage === USER_SWAP_REJECTED_ERROR) {
      sendTradeAnalytics('Reject', orderType, marketLabel)
    } else {
      sendTradeAnalytics('Error', orderType, marketLabel, error.code)
    }
  },
}

export const useTradeFlowAnalytics = () => tradeFlowAnalytics
