import { signTradeAnalytics, tradeAnalytics } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { USER_SWAP_REJECTED_ERROR } from 'modules/trade/utils/swapErrorHelper'

export interface TradeFlowAnalyticsContext {
  account: string | null
  recipient: string | null
  recipientAddress: string | null
  marketLabel?: string
  orderType: UiOrderType
}

export const tradeFlowAnalytics = {
  trade(context: TradeFlowAnalyticsContext) {
    tradeAnalytics('Send', context.orderType, context.marketLabel)
  },
  sign(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    signTradeAnalytics(orderType, marketLabel)
  },
  approveAndPresign(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    tradeAnalytics('Bundle Approve and Swap', orderType, marketLabel)
  },
  placeAdvancedOrder(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    tradeAnalytics('Place Advanced Order', orderType, marketLabel)
  },
  wrapApproveAndPresign(context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context
    tradeAnalytics('Bundled Eth Flow', orderType, marketLabel)
  },
  error(error: any, errorMessage: string, context: TradeFlowAnalyticsContext) {
    const { marketLabel, orderType } = context

    if (errorMessage === USER_SWAP_REJECTED_ERROR) {
      tradeAnalytics('Reject', orderType, marketLabel)
    } else {
      tradeAnalytics(
        'Error',
        orderType,
        marketLabel,
        error.code && typeof error.code === 'number' ? error.code : undefined
      )
    }
  },
}
