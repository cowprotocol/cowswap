import { useState, useCallback } from 'react'

import TransactionConfirmationModal from 'legacy/components/TransactionConfirmationModal'
import { OperationType } from 'legacy/components/TransactionConfirmationModal'
import { useOpenModal, useCloseModals, useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

export default function useTransactionConfirmationModal(
  defaultOperationType: OperationType = OperationType.WRAP_ETHER
) {
  const [operationType, setOperationType] = useState<OperationType>(defaultOperationType)
  const [transactionConfirmationModalMsg, setTransactionConfirmationModalMsg] = useState<string>()
  const openTransactionConfirmationModalAux = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)
  const closeModal = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)
  const openModal = useCallback(
    (message: string, operationType: OperationType) => {
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
