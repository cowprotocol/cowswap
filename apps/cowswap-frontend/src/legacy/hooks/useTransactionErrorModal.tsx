import { useCallback } from 'react'

import { useCloseModals, useModalIsOpen, useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { CowModal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

export default function useTransactionErrorModal() {
  const openModal = useOpenModal(ApplicationModal.TRANSACTION_ERROR)
  const closeModal = useCloseModals()
  const showTransactionErrorModal = useModalIsOpen(ApplicationModal.TRANSACTION_ERROR)

  return {
    openModal,
    closeModal,
    TransactionErrorModal: useCallback(
      ({ message, onDismiss }: { message?: string; onDismiss: () => void }) => (
        <CowModal isOpen={!!message && showTransactionErrorModal} onDismiss={closeModal}>
          <TransactionErrorContent onDismiss={onDismiss} message={message || ''} />
        </CowModal>
      ),
      [closeModal, showTransactionErrorModal]
    ),
  }
}
