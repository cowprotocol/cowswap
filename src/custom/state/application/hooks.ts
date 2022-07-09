import { createAction } from '@reduxjs/toolkit'
import { DEFAULT_TXN_DISMISS_MS } from '@src/constants/misc'
import { useToggleModal } from '@src/state/application/hooks'
import { useCallback } from 'react'
import { addPopup, ApplicationModal, PopupContent } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { useAtom } from 'jotai'
import {
  handleFollowPendingTxPopupAtom,
  handleHidePopupPermanentlyAtom,
  showFollowTxPopupAtom,
} from 'state/application/atom'

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

// Allow show popup
// actions to use followPendingTxPopup atom
export const useFollowPendingTxPopup = () => {
  const [, _setFollowPendingPopup] = useAtom(handleFollowPendingTxPopupAtom)
  const [, _setHidePopup] = useAtom(handleHidePopupPermanentlyAtom)
  const [_showFollowPendingTxPopup] = useAtom(showFollowTxPopupAtom)

  const setShowFollowPendingTxPopup = useCallback(
    (showPopup: boolean) => {
      _setFollowPendingPopup(showPopup)
    },
    [_setFollowPendingPopup]
  )

  const setHidePendingTxPopupPermanently = useCallback(
    (hidePopup: boolean) => {
      _setHidePopup(hidePopup)
    },
    [_setHidePopup]
  )

  return {
    showFollowPendingTxPopup: _showFollowPendingTxPopup,
    setShowFollowPendingTxPopup,
    setHidePendingTxPopupPermanently,
  }
}
