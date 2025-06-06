import { useCowAnalytics } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { USER_SWAP_REJECTED_ERROR } from '../../../common/utils/getSwapErrorMessage'

export interface TradeFlowAnalyticsContext {
  account: string | null
  recipient?: string | null
  recipientAddress?: string | null
  marketLabel?: string
  orderType: UiOrderType
}

export interface TradeFlowAnalytics {
  trade(context: TradeFlowAnalyticsContext): void
  sign(context: TradeFlowAnalyticsContext): void
  approveAndPresign(context: TradeFlowAnalyticsContext): void
  placeAdvancedOrder(context: TradeFlowAnalyticsContext): void
  wrapApproveAndPresign(context: TradeFlowAnalyticsContext): void
  error(error: Error & { code?: number }, errorMessage: string, context: TradeFlowAnalyticsContext): void
}

export function useTradeFlowAnalytics(): TradeFlowAnalytics {
  const analytics = useCowAnalytics()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendTradeAnalytics = (action: string, orderType: UiOrderType, marketLabel?: string, value?: number) => {
    analytics.sendEvent({
      category: CowSwapAnalyticsCategory.TRADE,
      action,
      label: `${orderType}|${marketLabel}`,
      ...(value !== undefined && { value }),
    })
  }

  return {
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
}
