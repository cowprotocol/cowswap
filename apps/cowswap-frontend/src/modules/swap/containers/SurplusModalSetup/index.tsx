import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { CowModal } from 'common/pure/Modal'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { useTradeConfirmState } from '../../../trade'
import { useOrderIdForSurplusModal, useRemoveOrderFromSurplusQueue } from '../../state/surplusModal'
import { useNavigateToNewOrderCallback, useSetupAdditionalProgressBarProps } from '../ConfirmSwapModalSetup'

// TODO: rename?
export function SurplusModalSetup() {
  const orderId = useOrderIdForSurplusModal()
  const removeOrderId = useRemoveOrderFromSurplusQueue()

  const { chainId } = useWalletInfo()
  const order = useOrder({ id: orderId, chainId })

  const progressBarV2Props = useSetupAdditionalProgressBarProps(chainId, order)
  const { surplusData, isProgressBarSetup, activityDerivedState } = progressBarV2Props
  const { showSurplus } = surplusData

  const { isOpen: isConfirmationModalOpen, transactionHash } = useTradeConfirmState()

  const onDismiss = useCallback(() => {
    orderId && removeOrderId(orderId)
  }, [orderId, removeOrderId])

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  const isOpen =
    !!orderId &&
    // Open when confirmation modal is closed OR the order we are trying to show is not the one in display
    (!isConfirmationModalOpen || (!!transactionHash && transactionHash !== orderId)) &&
    // Open when we want to show surplus or when the progress bar is active
    (showSurplus === true || isProgressBarSetup)

  useEffect(() => {
    // If we should NOT show the screen, remove the orderId from the queue
    if (
      orderId &&
      // Don't remove it while the modal is open
      !isOpen &&
      // Remove when there's no relevant surplus and the order is filled
      ((showSurplus === false && order?.status === 'fulfilled') ||
        // OR when the confirmation is open and the current order is already in display
        (isConfirmationModalOpen && transactionHash === orderId))
    ) {
      removeOrderId(orderId)
    }
  }, [orderId, isOpen, order?.status, removeOrderId, showSurplus, isConfirmationModalOpen])

  if (!orderId) {
    return null
  }

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} maxWidth={470}>
      <TransactionSubmittedContent
        onDismiss={onDismiss}
        chainId={chainId}
        hash={orderId}
        activityDerivedState={activityDerivedState}
        orderProgressBarV2Props={progressBarV2Props}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    </CowModal>
  )
}
