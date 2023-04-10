import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { GpModal as Modal } from '@cow/common/pure/Modal'
import { useAtomValue } from 'jotai/utils'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { shortenOrderId } from 'utils'

interface Props {
  isOpen: boolean
  onDismiss: () => void
}

export function MultipleOrdersCancellationModal(props: Props) {
  const { isOpen, onDismiss } = props
  const ordersToCancel = useAtomValue(ordersToCancelAtom)

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ConfirmationModalContent
        title={`Cancel orders ${ordersToCancel.map((order) => shortenOrderId(order.id)).join(',')}`}
        onDismiss={onDismiss}
        topContent={() => <h3>Top content</h3>}
        bottomContent={() => <h3>Bottom content</h3>}
      />
    </Modal>
  )
}
