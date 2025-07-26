import { ReactNode } from 'react'

import { ActivityDerivedState } from 'common/types/activity'

import { computeOrderPendingState } from '../utils/bridgeStateHelpers'
import { createHooksDetails, createOrderBasicDetails } from '../utils/orderDetailsHelpers'
import { computeOrderSummary, computeTokens, OrderSummaryType } from '../utils/orderSummaryHelpers'
import { computeCustomRecipientState } from '../utils/recipientHelpers'

// Helper function to compute derived states
export function useComputedStates(
  order: ActivityDerivedState['order'],
  activityDerivedState: ActivityDerivedState,
  enhancedTransaction: ActivityDerivedState['enhancedTransaction'],
  chainId: number,
  isOrder: boolean,
  isBridgeOrder: boolean,
  swapAndBridgeContext: unknown,
  swapAndBridgeOverview: unknown,
  bridgeOrderData: unknown,
): {
  isOrderPending: boolean
  orderSummary: OrderSummaryType
  rateInfoParams: unknown
  isOrderFulfilled: boolean
  inputToken: unknown
  outputToken: unknown
  activityName: string
  isCustomRecipient: boolean
  hooksDetails: ReactNode
  orderBasicDetails: ReactNode
} {
  const isOrderPending = computeOrderPendingState(isBridgeOrder, swapAndBridgeContext, bridgeOrderData, order)
  const { orderSummary, rateInfoParams, isOrderFulfilled } = computeOrderSummary(order, chainId)
  const { inputToken, outputToken } = computeTokens(activityDerivedState, enhancedTransaction, chainId)
  const activityName = isOrder ? `${orderSummary.kind} order` : 'Transaction'

  const fullAppData = order?.apiAdditionalInfo?.fullAppData || order?.fullAppData
  const { isCustomRecipient } = computeCustomRecipientState(order, isBridgeOrder, swapAndBridgeOverview)

  const hooksDetails = createHooksDetails(fullAppData)
  const orderBasicDetails = createOrderBasicDetails(rateInfoParams, orderSummary.validTo)

  return {
    isOrderPending,
    orderSummary,
    rateInfoParams,
    isOrderFulfilled,
    inputToken,
    outputToken,
    activityName,
    isCustomRecipient,
    hooksDetails,
    orderBasicDetails,
  }
}