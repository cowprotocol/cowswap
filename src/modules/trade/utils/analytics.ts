import { OrderClass } from '@cowprotocol/cow-sdk'

import { signTradeAnalytics, tradeAnalytics } from 'legacy/components/analytics'

import { USER_SWAP_REJECTED_ERROR } from 'modules/trade/utils/swapErrorHelper'

export interface SwapFlowAnalyticsContext {
  account: string | null
  recipient: string | null
  recipientAddress: string | null
  marketLabel?: string
  orderClass: OrderClass
}

export const tradeFlowAnalytics = {
  trade(context: SwapFlowAnalyticsContext) {
    tradeAnalytics('Send', context.orderClass, context.marketLabel)
  },
  sign(context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context
    signTradeAnalytics(orderClass, marketLabel)
  },
  approveAndPresign(context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context
    tradeAnalytics('Bundle Approve and Swap', orderClass, marketLabel)
  },
  wrapApproveAndPresign(context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context
    tradeAnalytics('Bundled Eth Flow', orderClass, marketLabel)
  },
  error(error: any, errorMessage: string, context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context

    if (errorMessage === USER_SWAP_REJECTED_ERROR) {
      tradeAnalytics('Reject', orderClass, marketLabel)
    } else {
      tradeAnalytics(
        'Error',
        orderClass,
        marketLabel,
        error.code && typeof error.code === 'number' ? error.code : undefined
      )
    }
  },
}
