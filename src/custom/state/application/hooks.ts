import { createAction } from '@reduxjs/toolkit'

import { ApplicationModal } from 'state/application/actions'
import { useToggleModal } from '@src/state/application/hooks'
export * from '@src/state/application/hooks'

export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')

export function useToggleTransactionConfirmation(): () => void {
  return useToggleModal(ApplicationModal.TRANSACTION_CONFIRMATION)
}
