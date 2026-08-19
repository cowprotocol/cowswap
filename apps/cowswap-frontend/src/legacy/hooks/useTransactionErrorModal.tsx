import { useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { useCloseModals, useModalIsOpen, useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { Modal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function useTransactionErrorModal() {
  const openModal = useOpenModal(ApplicationModal.TRANSACTION_ERROR)
  const closeModal = useCloseModals()
  const showTransactionErrorModal = useModalIsOpen(ApplicationModal.TRANSACTION_ERROR)

  const TransactionErrorModal = useCallback(
    ({ message, onDismiss }: { message?: string; onDismiss: Command }) => (
      <Modal isOpen={!!message && showTransactionErrorModal} onOpenChange={closeModal}>
        <TransactionErrorContent modalMode onDismiss={onDismiss} message={message || ''} />
      </Modal>
    ),
    [closeModal, showTransactionErrorModal],
  )

  return useMemo(
    () => ({
      openModal,
      closeModal,
      TransactionErrorModal,
    }),
    [openModal, closeModal, TransactionErrorModal],
  )
}
