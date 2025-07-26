import { useBridgeOrderData } from 'entities/bridgeOrders'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useSwapAndBridgeContext } from 'common/hooks/useSwapAndBridgeContext'
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
  swapAndBridgeContext: unknown
  swapResultContext: unknown
  swapAndBridgeOverview: unknown
  bridgeOrderData: unknown
  surplusFiatValue: unknown
  showFiatValue: boolean
  surplusToken: unknown
  surplusAmount: unknown
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