import { Order } from '@src/custom/state/orders/actions'
import { GpModal } from 'components/Modal'

interface ReceiptProps {
  isOpen: boolean
  selectedOrder: Order | null
  onDismiss: () => void
}

export function ReceiptModal({ isOpen, onDismiss, selectedOrder }: ReceiptProps) {
  if (!selectedOrder) {
    return null
  }

  return (
    <GpModal onDismiss={onDismiss} isOpen={isOpen}>
      ReceiptModal
    </GpModal>
  )
}
