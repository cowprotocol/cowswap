import { BridgeOrderData } from '@cowprotocol/types'

import { useBridgeOrderData } from 'entities/bridgeOrders'

import { SurplusData, useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SwapAndBridgeContexts, useSwapAndBridgeContext } from 'common/hooks/useSwapAndBridgeContext'
import { ActivityDerivedState } from 'common/types/activity'

import { computeBridgeState } from '../utils/bridgeStateHelpers'

// Helper function to compute bridge and surplus data
export function useBridgeAndSurplusData(
  order: ActivityDerivedState['order'],
  chainId: number,
  isExpired: boolean,
  isCancelled: boolean,
  isFailed: boolean,
  isCancelling: boolean,
): {
  isBridgeOrder: boolean
  swapAndBridgeContext: SwapAndBridgeContexts['swapAndBridgeContext']
  swapResultContext: SwapAndBridgeContexts['swapResultContext']
  swapAndBridgeOverview: SwapAndBridgeContexts['swapAndBridgeOverview']
  bridgeOrderData: BridgeOrderData | undefined
  surplusFiatValue: SurplusData['surplusFiatValue']
  showFiatValue: boolean
  surplusToken: SurplusData['surplusToken']
  surplusAmount: SurplusData['surplusAmount']
} {
  const isBridgeOrder = computeBridgeState(order, isExpired, isCancelled, isFailed, isCancelling)
  const { swapAndBridgeContext, swapResultContext, swapAndBridgeOverview } = useSwapAndBridgeContext(
    chainId,
    isBridgeOrder ? order : undefined,
    undefined,
  )
  const bridgeOrderData = useBridgeOrderData(order?.id)
  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = useGetSurplusData(order)

  return {
    isBridgeOrder,
    swapAndBridgeContext,
    swapResultContext,
    swapAndBridgeOverview,
    bridgeOrderData,
    surplusFiatValue,
    showFiatValue,
    surplusToken,
    surplusAmount,
  }
}