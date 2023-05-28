import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { transactionConfirmAtom, TransactionConfirmState } from 'modules/swap/state/transactionConfirmAtom'

import { useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

export function useTransactionConfirmModal() {
  const setTransactionConfirm = useUpdateAtom(transactionConfirmAtom)
  const openTxConfirmationModal = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)

  return useCallback(
    (state: TransactionConfirmState) => {
      setTransactionConfirm(state)
      openTxConfirmationModal()
    },
    [setTransactionConfirm, openTxConfirmationModal]
  )
}
