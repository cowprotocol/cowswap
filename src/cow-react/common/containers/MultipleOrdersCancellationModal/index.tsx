import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  OperationType,
} from 'components/TransactionConfirmationModal'
import { GpModal as Modal } from '@cow/common/pure/Modal'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { shortenOrderId } from 'utils'
import { useCancelMultipleOrders } from '@cow/common/hooks/useMultipleOrdersCancellation/useCancelMultipleOrders'
import { useWalletInfo } from '@cow/modules/wallet'
import { useCallback, useState } from 'react'
import { useRequestOrderCancellation } from 'state/orders/hooks'
import { useAtom } from 'jotai'

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

  const dismissAll = useCallback(() => {
    setCancellationInProgress(false)
    onDismiss()
  }, [onDismiss])

  const signAndSendCancellation = useCallback(async () => {
    if (!chainId) return

    // Show pending modal
    setCancellationInProgress(true)

    // TODO: display modal in case of error
    try {
      // Sign and send cancellation message
      await cancelAll(ordersToCancel)

      // Change orders state in store
      ordersToCancel.forEach((order) => {
        cancelPendingOrder({ chainId, id: order.id })
      })

      // Clean cancellation queue
      setOrdersToCancel([])
    } finally {
      dismissAll()
    }
  }, [chainId, cancelPendingOrder, cancelAll, ordersToCancel, dismissAll, setOrdersToCancel])

  if (!isOpen || !chainId) return null

  // TODO: add styles and layout
  if (cancellationInProgress) {
    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <ConfirmationPendingContent
          chainId={chainId}
          onDismiss={onDismiss}
          pendingText={<>Cancelling {ordersToCancel.length} orders</>}
          operationType={OperationType.ORDER_CANCEL}
        />
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ConfirmationModalContent
        title={`Cancel orders ${ordersToCancel.map((order) => shortenOrderId(order.id)).join(',')}`}
        onDismiss={onDismiss}
        topContent={() => <h3>Top content</h3>}
        bottomContent={() => (
          <div>
            <button onClick={signAndSendCancellation}>Cancel all</button>
            <button onClick={onDismiss}>Dismiss</button>
          </div>
        )}
      />
    </Modal>
  )
}
