import { OrderClass } from '@cowprotocol/cow-sdk'

import { signSwapAnalytics, swapAnalytics } from 'legacy/components/analytics'

import { USER_SWAP_REJECTED_ERROR } from 'modules/trade/utils/swapErrorHelper'

export interface SwapFlowAnalyticsContext {
  account: string | null
  recipient: string | null
  recipientAddress: string | null
  marketLabel?: string
  orderClass: OrderClass
}

export const tradeFlowAnalytics = {
  swap(context: SwapFlowAnalyticsContext) {
    swapAnalytics('Send', context.orderClass, context.marketLabel)
  },
  sign(context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context
    signSwapAnalytics(orderClass, marketLabel)
  },
  approveAndPresign(context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context
    swapAnalytics('Bundle Approve and Swap', orderClass, marketLabel)
  },
  wrapApproveAndPresign(context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context
    swapAnalytics('Bundled Eth Flow', orderClass, marketLabel)
  },
  error(error: any, errorMessage: string, context: SwapFlowAnalyticsContext) {
    const { marketLabel, orderClass } = context

    if (errorMessage === USER_SWAP_REJECTED_ERROR) {
      swapAnalytics('Reject', orderClass, marketLabel)
    } else {
      swapAnalytics(
        'Error',
        orderClass,
        marketLabel,
        error.code && typeof error.code === 'number' ? error.code : undefined
      )
    }
  },
}
