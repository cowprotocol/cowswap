/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { SwapAndBridgeStatus } from 'modules/bridge/types'

import { useSwapAndBridgeContext } from 'common/hooks/useSwapAndBridgeContext'
import { ActivityDerivedState, ActivityStatus } from 'common/types/activity'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

/**
 * Enhances activity derived state for bridge orders by incorporating bridge status
 * This hook takes the basic activity state and internally fetches bridge context to provide accurate
 * status information for bridge orders that combines both swap and bridge states
 */
export function useEnhancedActivityDerivedState(
  activityDerivedState: ActivityDerivedState,
  chainId: SupportedChainId,
): ActivityDerivedState {
  const order = activityDerivedState.order
  const isBridgeOrder = order && getIsBridgeOrder(order)

  // Only fetch bridge context for bridge orders
  const { swapAndBridgeContext, isLoading: isBridgeDataLoading } = useSwapAndBridgeContext(
    chainId,
    isBridgeOrder ? order : undefined,
    undefined,
  )

  return useMemo(() => {
    // For non-bridge orders, return original state
    if (!isBridgeOrder) {
      return activityDerivedState
    }

    // For bridge orders where bridge data is still loading, show loading state
    if (isBridgeDataLoading) {
      return {
        ...activityDerivedState,
        status: ActivityStatus.LOADING,
        isConfirmed: false,
        isFailed: false,
        isPending: false,
        isLoading: true, // Custom flag to indicate loading state
      }
    }

    // For bridge orders without bridge context, we need to be more careful:
    // If the swap is confirmed but we don't have bridge data yet, show loading status
    // BUT preserve original flags to allow individual step rendering
    if (!swapAndBridgeContext?.bridgingStatus) {
      // If swap is confirmed but we don't have bridge context, the overall status should be loading
      // but we preserve the original state flags so individual steps can still be rendered
      if (activityDerivedState.isConfirmed) {
        return {
          ...activityDerivedState,
          status: ActivityStatus.LOADING,
          // Keep original isConfirmed so swap step can show as completed
          // but add isLoading flag for overall status display
          isLoading: true,
        }
      }
      // For non-confirmed swaps (pending, failed, etc.), use original state
      return activityDerivedState
    }

    // For bridge orders, override the status flags based on bridge status
    const bridgeStatus = swapAndBridgeContext.bridgingStatus
    const isConfirmed = bridgeStatus === SwapAndBridgeStatus.DONE
    const isFailed = bridgeStatus === SwapAndBridgeStatus.FAILED || bridgeStatus === SwapAndBridgeStatus.REFUND_COMPLETE
    const isPending = bridgeStatus === SwapAndBridgeStatus.PENDING || bridgeStatus === SwapAndBridgeStatus.DEFAULT

    return {
      ...activityDerivedState,
      isConfirmed,
      isFailed,
      isPending,
      isLoading: false,
    }
  }, [activityDerivedState, swapAndBridgeContext?.bridgingStatus, isBridgeDataLoading, isBridgeOrder])
}
