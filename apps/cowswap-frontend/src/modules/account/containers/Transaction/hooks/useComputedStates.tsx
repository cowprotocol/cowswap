import { ReactNode } from 'react'

import { BridgeOrderData } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { SwapAndBridgeContexts } from 'common/hooks/useSwapAndBridgeContext'
import { RateInfoParams } from 'common/pure/RateInfo'
import { ActivityDerivedState } from 'common/types/activity'

import { computeOrderPendingState } from '../utils/bridgeStateHelpers'
import { HooksDetails, OrderBasicDetails } from '../utils/orderDetailsHelpers'
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
  swapAndBridgeContext: SwapAndBridgeContexts['swapAndBridgeContext'],
  swapAndBridgeOverview: SwapAndBridgeContexts['swapAndBridgeOverview'],
  bridgeOrderData: BridgeOrderData | undefined,
): {
  isOrderPending: boolean
  orderSummary: OrderSummaryType
  rateInfoParams: RateInfoParams
  isOrderFulfilled: boolean
  inputToken: Currency | null
  outputToken: Currency | null
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

  const hooksDetails = <HooksDetails fullAppData={fullAppData} />
  const orderBasicDetails = <OrderBasicDetails rateInfoParams={rateInfoParams} validTo={orderSummary.validTo} />

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