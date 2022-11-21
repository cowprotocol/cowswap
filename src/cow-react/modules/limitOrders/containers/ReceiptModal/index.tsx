import { ReceiptModal as ReceiptModalPure } from '@cow/modules/limitOrders/pure/ReceiptModal'
import { useAtomValue } from 'jotai/utils'
import { receiptAtom } from '@cow/modules/limitOrders/state/limitOrdersReceiptAtom'
import { useCloseReceiptModal } from './hooks'

export function ReceiptModal() {
  const { selected } = useAtomValue(receiptAtom)
  const closeReceiptModal = useCloseReceiptModal()

  return <ReceiptModalPure selectedOrder={selected} isOpen={!!selected} onDismiss={closeReceiptModal} />
}
