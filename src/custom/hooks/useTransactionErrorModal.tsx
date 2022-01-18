import { useCallback } from 'react'
import { ApplicationModal } from 'state/application/reducer'
import { TransactionErrorContent } from 'components/TransactionConfirmationModal'
import { useOpenModal, useCloseModals, useModalOpen } from 'state/application/hooks'
import { GpModal } from '../components/Modal'

export default function useTransactionErrorModal() {
  const openModal = useOpenModal(ApplicationModal.TRANSACTION_ERROR)
  const closeModal = useCloseModals()
  const showTransactionErrorModal = useModalOpen(ApplicationModal.TRANSACTION_ERROR)

  return {
    openModal,
    closeModal,
    TransactionErrorModal: useCallback(
      ({ message, onDismiss }: { message?: string; onDismiss: () => void }) => (
        <GpModal isOpen={showTransactionErrorModal} onDismiss={closeModal}>
          <TransactionErrorContent onDismiss={onDismiss} message={message} />
        </GpModal>
      ),
      [closeModal, showTransactionErrorModal]
    ),
  }
}
