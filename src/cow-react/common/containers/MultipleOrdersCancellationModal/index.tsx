import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { GpModal as Modal } from '@cow/common/pure/Modal'
import { useAtomValue } from 'jotai/utils'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { shortenOrderId } from 'utils'
import { useCancelMultipleOrders } from '@cow/common/hooks/useMultipleOrdersCancellation/useCancelMultipleOrders'

interface Props {
  isOpen: boolean
  onDismiss: () => void
}

export function MultipleOrdersCancellationModal(props: Props) {
  const { isOpen, onDismiss } = props

  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const cancelAll = useCancelMultipleOrders()

  if (!isOpen) return null

  // TODO: add styles and layout

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ConfirmationModalContent
        title={`Cancel orders ${ordersToCancel.map((order) => shortenOrderId(order.id)).join(',')}`}
        onDismiss={onDismiss}
        topContent={() => <h3>Top content</h3>}
        bottomContent={() => (
          <div>
            <button onClick={() => cancelAll(ordersToCancel)}>Cancel all</button>
            <button onClick={onDismiss}>Dismiss</button>
          </div>
        )}
      />
    </Modal>
  )
}
