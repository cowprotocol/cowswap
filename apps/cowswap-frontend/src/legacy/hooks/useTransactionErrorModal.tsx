import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

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
      ({ message, onDismiss }: { message?: string; onDismiss: Command }) => (
        <CowModal isOpen={!!message && showTransactionErrorModal} onDismiss={closeModal}>
          <TransactionErrorContent modalMode onDismiss={onDismiss} message={message || ''} />
        </CowModal>
      ),
      [closeModal, showTransactionErrorModal]
    ),
  }
}
