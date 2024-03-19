import { useCallback, useMemo } from 'react'

import { DEFAULT_TXN_DISMISS_MS } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { createAction } from '@reduxjs/toolkit'

import { addPopup, ApplicationModal, PopupContent, removePopup } from './reducer'

import { useAppDispatch, useAppSelector } from '../hooks'
import { AppState } from '../index'

export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')

export function useModalIsOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): Command {
  const isOpen = useModalIsOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(isOpen ? null : modal)), [dispatch, modal, isOpen])
}

export function useCloseModal(_modal: ApplicationModal): Command {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}
export function useToggleWalletModal(): Command | null {
  const { active } = useWalletInfo()

  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)

  return useMemo(() => {
    return active ? toggleWalletModal : null
  }, [active, toggleWalletModal])
}

export function useToggleSettingsMenu(): Command {
  return useToggleModal(ApplicationModal.SETTINGS)
}

/**
 * @deprecated use @cowprotocol/snackbars instead
 */
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

/**
 * @deprecated use @cowprotocol/snackbars instead
 */
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useAppSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter((item) => item.show), [list])
}

// TODO: These two seem to be gone from original. Check whether they have been replaced
export function useOpenModal(modal: ApplicationModal): Command {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): Command {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}
/**
 * TODO: remove with the whole popups feature
 * @deprecated use @cowprotocol/snackbars instead
 */
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
