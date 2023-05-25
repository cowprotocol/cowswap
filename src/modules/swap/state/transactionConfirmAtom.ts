import { atom } from 'jotai'
import { OperationType } from 'legacy/components/TransactionConfirmationModal'

export interface TransactionConfirmState {
  operationType: OperationType
  pendingText: string
}

export const transactionConfirmAtom = atom<TransactionConfirmState>({
  operationType: OperationType.UNWRAP_WETH,
  pendingText: '',
})
