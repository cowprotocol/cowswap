import { useMemo } from 'react'

import { GtmEvent, useCowAnalytics } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { USER_SWAP_REJECTED_ERROR } from 'common/utils/getSwapErrorMessage'

export interface TradeFlowAnalyticsContext {
  account: string | null
  recipient?: string | null
  recipientAddress?: string | null
  marketLabel?: string
  isBridgeOrder?: boolean
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

  return useMemo(() => {
    const sendTradeAnalytics = (
      action: string,
      orderType: UiOrderType,
      marketLabel?: string,
      value?: number,
      isBridgeOrder?: boolean,
    ): void => {
      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action,
        label: `${orderType}|${marketLabel}`,
        ...(value !== undefined && { value }),
        isBridgeOrder,
      } as GtmEvent<CowSwapAnalyticsCategory.TRADE>)
    }

    return {
      trade(context: TradeFlowAnalyticsContext) {
        sendTradeAnalytics('Send', context.orderType, context.marketLabel, undefined, context.isBridgeOrder)
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
        sendTradeAnalytics('Bundled Eth Flow', orderType, marketLabel, undefined, context.isBridgeOrder)
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
  }, [analytics])
}
