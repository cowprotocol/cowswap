import { ReactNode } from 'react'

import { getActivityState } from 'legacy/hooks/useActivityDerivedState'

import { useEnhancedActivityDerivedState } from 'common/hooks/useEnhancedActivityDerivedState'
import { ActivityDerivedState } from 'common/types/activity'

import { useBasicActivityState } from './useBasicActivityState'
import { useBridgeAndSurplusData } from './useBridgeAndSurplusData'
import { useComputedStates } from './useComputedStates'
import { useUIStateAndCallbacks } from './useUIStateAndCallbacks'

import { OrderSummaryType } from '../utils/orderSummaryHelpers'

// Helper function to assemble the final return object
function assembleActivityDetailsReturn(
  basicState: ReturnType<typeof useBasicActivityState>,
  enhancedActivityDerivedState: ActivityDerivedState,
  bridgeAndSurplusData: ReturnType<typeof useBridgeAndSurplusData>,
  uiState: ReturnType<typeof useUIStateAndCallbacks>,
  computedStates: ReturnType<typeof useComputedStates>,
  isCustomRecipientWarningVisible: boolean,
): ReturnType<typeof useActivityDetailsState> {
  return {
    ...basicState,
    enhancedActivityDerivedState,
    ...bridgeAndSurplusData,
    ...uiState,
    ...computedStates,
    isCustomRecipientWarningVisible,
  }
}

// Hook to manage all ActivityDetails state
export function useActivityDetailsState(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
  disableProgressBar: boolean | undefined
}): {
  id: string
  isOrder: boolean
  order: ActivityDerivedState['order']
  enhancedTransaction: ActivityDerivedState['enhancedTransaction']
  singleToken: unknown
  isSwap: boolean
  enhancedActivityDerivedState: ActivityDerivedState
  isBridgeOrder: boolean
  swapAndBridgeContext: unknown
  swapResultContext: unknown
  swapAndBridgeOverview: unknown
  surplusFiatValue: unknown
  showFiatValue: boolean
  surplusToken: unknown
  surplusAmount: unknown
  receiverEnsName: string | undefined
  hideCustomRecipientWarning: (id: string) => void
  showCancellationModal: (() => void) | null
  showProgressBarCallback: (() => void) | null
  isOrderPending: boolean
  orderSummary: OrderSummaryType
  rateInfoParams: unknown
  isOrderFulfilled: boolean
  inputToken: unknown
  outputToken: unknown
  activityName: string
  isCustomRecipient: boolean
  isCustomRecipientWarningVisible: boolean
  hooksDetails: ReactNode
  orderBasicDetails: ReactNode
} {
  const { chainId, activityDerivedState, disableProgressBar } = props

  const basicState = useBasicActivityState(activityDerivedState, chainId)
  const { isExpired, isCancelled, isFailed, isCancelling, order, id, isSwap } = basicState

  const enhancedActivityDerivedState = useEnhancedActivityDerivedState(activityDerivedState, chainId)
  const enhancedActivityState = getActivityState(enhancedActivityDerivedState)

  const bridgeAndSurplusData = useBridgeAndSurplusData(order, chainId, isExpired, isCancelled, isFailed, isCancelling)
  const { isBridgeOrder, swapAndBridgeContext, swapAndBridgeOverview, bridgeOrderData } = bridgeAndSurplusData

  const uiState = useUIStateAndCallbacks(id, order, enhancedActivityState, isSwap, isBridgeOrder, disableProgressBar)
  const { isCustomRecipientWarningBannerVisible } = uiState

  const computedStates = useComputedStates(
    order,
    activityDerivedState,
    basicState.enhancedTransaction,
    chainId,
    basicState.isOrder,
    isBridgeOrder,
    swapAndBridgeContext,
    swapAndBridgeOverview,
    bridgeOrderData,
  )
  const { isOrderPending } = computedStates

  const isCustomRecipientWarningVisible = isCustomRecipientWarningBannerVisible && order && isOrderPending

  return assembleActivityDetailsReturn(
    basicState,
    enhancedActivityDerivedState,
    bridgeAndSurplusData,
    uiState,
    computedStates,
    isCustomRecipientWarningVisible,
  )
}
