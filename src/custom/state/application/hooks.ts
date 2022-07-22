import { createAction } from '@reduxjs/toolkit'
import { DEFAULT_TXN_DISMISS_MS } from '@src/constants/misc'
import { useToggleModal } from '@src/state/application/hooks'
import { useCallback, useEffect } from 'react'
import { addPopup, ApplicationModal, PopupContent } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { handleFollowPendingTxPopupAtom, showFollowTxPopupAtom, useUpdateAtom, useAtomValue } from './atoms'

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

// mod: add removeAfterMs change
// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string, removeAfterMs?: number | null) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number | null) => {
      dispatch(
        addPopup({
          content,
          key,
          removeAfterMs: removeAfterMs === null ? null : removeAfterMs ?? DEFAULT_TXN_DISMISS_MS,
        })
      )
    },
    [dispatch]
  )
}

// Set pop up closed if it has not been closed and not fulfill a condition such as not pending tx
export function useCloseFollowTxPopupIfNot(fulfillsCondition: boolean) {
  const setShowFollowTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const showingPopup = useAtomValue(showFollowTxPopupAtom)

  const closeIfNotFulfillsCondition = useCallback(
    (_fulfillsCondition) => {
      if (!showingPopup) return

      !_fulfillsCondition && setShowFollowTxPopup(false)
    },
    [setShowFollowTxPopup, showingPopup]
  )

  useEffect(() => {
    closeIfNotFulfillsCondition(fulfillsCondition)
  }, [closeIfNotFulfillsCondition, fulfillsCondition])
}
