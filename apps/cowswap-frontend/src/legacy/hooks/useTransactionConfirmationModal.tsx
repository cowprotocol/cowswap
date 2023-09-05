import { useState, useCallback } from 'react'

import { TransactionConfirmationModal } from 'legacy/components/TransactionConfirmationModal'
import { useOpenModal, useCloseModals, useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { ConfirmOperationType } from '../state/types'

export default function useTransactionConfirmationModal(
  defaultOperationType: ConfirmOperationType = ConfirmOperationType.WRAP_ETHER
) {
  const [operationType, setOperationType] = useState<ConfirmOperationType>(defaultOperationType)
  const [transactionConfirmationModalMsg, setTransactionConfirmationModalMsg] = useState<string>()
  const openTransactionConfirmationModalAux = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)
  const closeModal = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)
  const openModal = useCallback(
    (message: string, operationType: ConfirmOperationType) => {
      setTransactionConfirmationModalMsg(message)
      setOperationType(operationType)
      openTransactionConfirmationModalAux()
    },
    [setTransactionConfirmationModalMsg, openTransactionConfirmationModalAux]
  )

  return {
    openModal,
    closeModal,
    TransactionConfirmationModal: useCallback(
      () => (
        <TransactionConfirmationModal
          attemptingTxn={true}
          isOpen={showTransactionConfirmationModal}
          pendingText={transactionConfirmationModalMsg}
          onDismiss={closeModal}
          operationType={operationType}
        />
      ),
      [closeModal, operationType, showTransactionConfirmationModal, transactionConfirmationModalMsg]
    ),
  }
}
