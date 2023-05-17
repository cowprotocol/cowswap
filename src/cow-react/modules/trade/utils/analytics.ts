import { bundleAnalytics, signSwapAnalytics, swapAnalytics } from 'components/analytics'
import { USER_SWAP_REJECTED_ERROR } from '@cow/modules/trade/utils/swapErrorHelper'
import { OrderClass } from '@cowprotocol/cow-sdk'
export interface SwapFlowAnalyticsContext {
  account: string | null
  recipient: string | null
  recipientAddress: string | null
  marketLabel?: string
  orderClass: OrderClass
}

type AnalyticsFn = typeof swapAnalytics | typeof bundleAnalytics

export const tradeFlowAnalytics = {
  swap(context: SwapFlowAnalyticsContext, analyticsFn: AnalyticsFn = swapAnalytics) {
    analyticsFn('Send', context.orderClass, context.marketLabel)
  },
  sign(context: SwapFlowAnalyticsContext, analyticsFn?: typeof bundleAnalytics) {
    const { marketLabel, orderClass } = context
    analyticsFn ? analyticsFn('Sign', orderClass, marketLabel) : signSwapAnalytics(orderClass, marketLabel)
  },
  error(error: any, errorMessage: string, context: SwapFlowAnalyticsContext, analyticsFn: AnalyticsFn = swapAnalytics) {
    const { marketLabel, orderClass } = context

    if (errorMessage === USER_SWAP_REJECTED_ERROR) {
      analyticsFn('Reject', orderClass, marketLabel)
    } else {
      analyticsFn(
        'Error',
        orderClass,
        marketLabel,
        error.code && typeof error.code === 'number' ? error.code : undefined
      )
    }
  },
}
