import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrderIdForSurplusModal, useRemoveOrderFromSurplusQueue } from 'entities/surplusModal'

import { useOrder } from 'legacy/state/orders/hooks'

import { useTradeConfirmState, useNavigateToNewOrderCallback } from 'modules/trade'

import { CowModal } from 'common/pure/Modal'

import { useOrderProgressBarProps } from '../../hooks/useOrderProgressBarProps'
import { TransactionSubmittedContent } from '../../pure/TransactionSubmittedContent'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SurplusModalSetup() {
  const orderId = useOrderIdForSurplusModal()
  const removeOrderId = useRemoveOrderFromSurplusQueue()

  const { chainId } = useWalletInfo()
  const order = useOrder({ id: orderId, chainId })

  const { props: progressBarProps, activityDerivedState } = useOrderProgressBarProps(chainId, order)
  const { isProgressBarSetup } = progressBarProps

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
        orderProgressBarProps={progressBarProps}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    </CowModal>
  )
}
