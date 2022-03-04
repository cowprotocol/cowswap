import { createAction } from '@reduxjs/toolkit'
import { useToggleModal } from '@src/state/application/hooks'
import { useCallback } from 'react'
import { ApplicationModal } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'

export * from '@src/state/application/hooks'

export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')

export function useToggleTransactionConfirmation(): () => void {
  return useToggleModal(ApplicationModal.TRANSACTION_CONFIRMATION)
}

// TODO: These two seem to be gone from original. Check whether they have been replaced
export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}
