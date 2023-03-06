import { signSwapAnalytics, swapAnalytics } from 'components/analytics'
import { USER_SWAP_REJECTED_ERROR } from '@cow/modules/trade/utils/swapErrorHelper'
import { OrderClass } from '@cowprotocol/cow-sdk'
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
