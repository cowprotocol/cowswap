import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { useTradeConfirmState, useNavigateToNewOrderCallback } from 'modules/trade'

import { useOrderProgressBarV2Props } from 'common/hooks/orderProgressBarV2'
import { CowModal } from 'common/pure/Modal'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { useOrderIdForSurplusModal, useRemoveOrderFromSurplusQueue } from '../../state/surplusModal'

// TODO: rename?
export function SurplusModalSetup() {
  const orderId = useOrderIdForSurplusModal()
  const removeOrderId = useRemoveOrderFromSurplusQueue()

  const { chainId } = useWalletInfo()
  const order = useOrder({ id: orderId, chainId })

  const progressBarV2Props = useOrderProgressBarV2Props(chainId, order)
  const { isProgressBarSetup, activityDerivedState } = progressBarV2Props

  const { isOpen: isConfirmationModalOpen, transactionHash } = useTradeConfirmState()

  const onDismiss = useCallback(() => {
    orderId && removeOrderId(orderId)
  }, [orderId, removeOrderId])

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  const isOpen =
    !!orderId &&
    // Open when confirmation modal is closed OR the order we are trying to show is not the one in display
    (!isConfirmationModalOpen || (!!transactionHash && transactionHash !== orderId)) &&
    // Open when the progress bar is active
    isProgressBarSetup

  useEffect(() => {
    // If we should NOT show the screen, remove the orderId from the queue
    if (
      orderId &&
      // Don't remove it while the modal is open
      !isOpen &&
      // Remove when the confirmation is open and the current order is already in display
      isConfirmationModalOpen &&
      transactionHash === orderId
    ) {
      removeOrderId(orderId)
    }
  }, [orderId, transactionHash, isOpen, order?.status, removeOrderId, isConfirmationModalOpen])

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
