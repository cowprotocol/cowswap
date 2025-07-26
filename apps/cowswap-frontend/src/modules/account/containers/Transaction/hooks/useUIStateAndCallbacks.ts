import { useMemo } from 'react'

import { useENS } from '@cowprotocol/ens'

import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { ActivityState } from 'legacy/hooks/useActivityDerivedState'

import { useToggleAccountModal } from 'modules/account'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import {
  useHideReceiverWalletBanner,
  useIsReceiverWalletBannerHidden,
} from 'common/state/receiverWalletBannerVisibility'
import { ActivityDerivedState } from 'common/types/activity'

const progressBarVisibleStates = [ActivityState.OPEN]

// Helper function to compute UI state and callbacks
export function useUIStateAndCallbacks(
  id: string,
  order: ActivityDerivedState['order'],
  enhancedActivityState: ActivityState,
  isSwap: boolean,
  isBridgeOrder: boolean,
  disableProgressBar: boolean | undefined,
): {
  receiverEnsName: string | null | undefined
  hideCustomRecipientWarning: (id: string) => void
  showProgressBarCallback: (() => void) | null
  showCancellationModal: (() => void) | null
  isCustomRecipientWarningBannerVisible: boolean
} {
  const { name: receiverEnsName } = useENS(order?.receiver)
  const hideCustomRecipientWarning = useHideReceiverWalletBanner()
  const setShowProgressBar = useAddOrderToSurplusQueue()
  const toggleAccountModal = useToggleAccountModal()
  const getShowCancellationModal = useCancelOrder()
  const isCustomRecipientWarningBannerVisible = !useIsReceiverWalletBannerHidden(id)

  const showProgressBarCallback = useMemo(() => {
    const showProgressBar =
      progressBarVisibleStates.includes(enhancedActivityState) &&
      (isSwap || isBridgeOrder) &&
      order &&
      !disableProgressBar

    if (!showProgressBar) return null
    return () => {
      setShowProgressBar(order.id)
      toggleAccountModal()
    }
  }, [enhancedActivityState, isSwap, isBridgeOrder, order, disableProgressBar, setShowProgressBar, toggleAccountModal])

  const showCancellationModal = order ? getShowCancellationModal(order) : null

  return {
    receiverEnsName,
    hideCustomRecipientWarning,
    showProgressBarCallback,
    showCancellationModal,
    isCustomRecipientWarningBannerVisible,
  }
}