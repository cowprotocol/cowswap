import { atom } from 'jotai'

import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'

export interface TransactionConfirmState {
  operationType: ConfirmOperationType
  pendingText: string
}

export const transactionConfirmAtom = atom<TransactionConfirmState>({
  operationType: ConfirmOperationType.UNWRAP_WETH,
  pendingText: '',
})
