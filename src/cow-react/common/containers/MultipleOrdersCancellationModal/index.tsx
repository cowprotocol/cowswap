import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  OperationType,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import { GpModal as Modal } from '@cow/common/pure/Modal'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { useCancelMultipleOrders } from '@cow/common/hooks/useMultipleOrdersCancellation/useCancelMultipleOrders'
import { useWalletInfo } from '@cow/modules/wallet'
import React, { useCallback, useState } from 'react'
import { useRequestOrderCancellation } from 'state/orders/hooks'
import { useAtom } from 'jotai'
import { ButtonPrimary } from 'components/Button'

interface Props {
  isOpen: boolean
  onDismiss: () => void
}

export function MultipleOrdersCancellationModal(props: Props) {
  const { isOpen, onDismiss } = props

  const { chainId } = useWalletInfo()
  const [ordersToCancel, setOrdersToCancel] = useAtom(ordersToCancelAtom)
  const cancelAll = useCancelMultipleOrders()
  const cancelPendingOrder = useRequestOrderCancellation()
  const [cancellationInProgress, setCancellationInProgress] = useState(false)
  const [cancellationError, setCancellationError] = useState<Error | null>(null)

  const ordersCount = ordersToCancel?.length || 0

  const dismissAll = useCallback(() => {
    setCancellationInProgress(false)
    onDismiss()
    setCancellationError(null)
  }, [onDismiss])

  const signAndSendCancellation = useCallback(async () => {
    if (!chainId || !ordersToCancel) return

    // Show pending modal
    setCancellationInProgress(true)

    try {
      // Sign and send cancellation message
      await cancelAll(ordersToCancel)

      // Change orders state in store
      ordersToCancel.forEach((order) => {
        cancelPendingOrder({ chainId, id: order.id })
      })

      // Clean cancellation queue
      setOrdersToCancel(null)
      dismissAll()
    } catch (error: any) {
      setCancellationInProgress(false)
      setCancellationError(error)
    }
  }, [chainId, cancelPendingOrder, cancelAll, ordersToCancel, dismissAll, setOrdersToCancel])

  if (!isOpen || !chainId) return null

  if (cancellationError) {
    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <TransactionErrorContent onDismiss={dismissAll} message={cancellationError.message} />
      </Modal>
    )
  }

  if (cancellationInProgress) {
    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <ConfirmationPendingContent
          chainId={chainId}
          onDismiss={onDismiss}
          pendingText={<>Cancelling {ordersCount} orders</>}
          operationType={OperationType.ORDER_CANCEL}
        />
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ConfirmationModalContent
        title={`Cancel multiple orders: ${ordersCount}`}
        onDismiss={onDismiss}
        topContent={() => (
          <div>
            <p>Are you sure you want to cancel {ordersCount} orders?</p>
          </div>
        )}
        bottomContent={() => (
          <div>
            <ButtonPrimary onClick={signAndSendCancellation}>Request cancellations</ButtonPrimary>
          </div>
        )}
      />
    </Modal>
  )
}
