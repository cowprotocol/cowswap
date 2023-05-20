import { useCallback } from 'react'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { TransactionErrorContent } from 'legacy/components/TransactionConfirmationModal'
import { useOpenModal, useCloseModals, useModalIsOpen } from 'legacy/state/application/hooks'
import { GpModal } from 'common/pure/Modal'

export default function useTransactionErrorModal() {
  const openModal = useOpenModal(ApplicationModal.TRANSACTION_ERROR)
  const closeModal = useCloseModals()
  const showTransactionErrorModal = useModalIsOpen(ApplicationModal.TRANSACTION_ERROR)

  return {
    openModal,
    closeModal,
    TransactionErrorModal: useCallback(
      ({ message, onDismiss }: { message?: string; onDismiss: () => void }) => (
        <GpModal isOpen={!!message && showTransactionErrorModal} onDismiss={closeModal}>
          <TransactionErrorContent onDismiss={onDismiss} message={message} />
        </GpModal>
      ),
      [closeModal, showTransactionErrorModal]
    ),
  }
}
