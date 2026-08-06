import { useMemo } from 'react'

import { GtmEvent, useCowAnalytics } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { USER_SWAP_REJECTED_ERROR } from 'common/utils/getSwapErrorMessage'

export interface TradeFlowAnalytics {
  trade(context: TradeFlowAnalyticsContext): void
  sign(context: TradeFlowAnalyticsContext): void
  approveAndPresign(context: TradeFlowAnalyticsContext): void
  placeAdvancedOrder(context: TradeFlowAnalyticsContext): void
  wrapApproveAndPresign(context: TradeFlowAnalyticsContext): void
  error(error: Error & { code?: number }, errorMessage: string, context: TradeFlowAnalyticsContext): void
}

export interface TradeFlowAnalyticsContext {
  account: string | null
  recipient?: string | null
  recipientAddress?: string | null
  marketLabel?: string
  isBridgeOrder?: boolean
  orderType: UiOrderType
  quoteId?: number
  allowsOffchainSigning?: boolean
}

export function useTradeFlowAnalytics(): TradeFlowAnalytics {
  const analytics = useCowAnalytics()

  return useMemo(() => {
    const sendTradeAnalytics = (action: string, context: TradeFlowAnalyticsContext, value?: number): void => {
      const { orderType, marketLabel, isBridgeOrder, quoteId, allowsOffchainSigning } = context

      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action,
        label: `${orderType}|${marketLabel}`,
        ...(value !== undefined && { value }),
        isBridgeOrder,
        ...(quoteId !== undefined && { quoteId }),
        ...(allowsOffchainSigning !== undefined && { allowsOffchainSigning }),
      } as GtmEvent<CowSwapAnalyticsCategory.TRADE>)
    }

    return {
      trade(context: TradeFlowAnalyticsContext) {
        sendTradeAnalytics('Send', context)
      },
      sign(context: TradeFlowAnalyticsContext) {
        sendTradeAnalytics('Sign', context)
      },
      approveAndPresign(context: TradeFlowAnalyticsContext) {
        sendTradeAnalytics('Bundle Approve and Swap', context)
      },
      placeAdvancedOrder(context: TradeFlowAnalyticsContext) {
        sendTradeAnalytics('Place Advanced Order', context)
      },
      wrapApproveAndPresign(context: TradeFlowAnalyticsContext) {
        sendTradeAnalytics('Bundled Eth Flow', context)
      },
      error(error: Error & { code?: number }, errorMessage: string, context: TradeFlowAnalyticsContext) {
        if (errorMessage === USER_SWAP_REJECTED_ERROR) {
          sendTradeAnalytics('Reject', context)
        } else {
          sendTradeAnalytics('Error', context, error.code)
        }
      },
    }
  }, [analytics])
}
