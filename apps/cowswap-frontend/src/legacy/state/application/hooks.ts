import { useCallback, useRef } from 'react'

import { Command } from '@cowprotocol/types'

import { createAction } from '@reduxjs/toolkit'
import { useAppKit } from '@reown/appkit/react'

import { ApplicationModal } from './reducer'

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

const WALLET_MODAL_OPEN_THROTTLE_MS = 1200

/** Opens AppKit wallet connection modal. Throttled so double-invocation (e.g. Strict Mode or duplicate handlers) only opens once and avoids two "Review permissions" dialogs in MetaMask. */
export function useToggleWalletModal(): Command {
  const { open } = useAppKit()
  const lastOpenTimeRef = useRef(0)

  return useCallback(() => {
    const now = Date.now()
    if (now - lastOpenTimeRef.current < WALLET_MODAL_OPEN_THROTTLE_MS) {
      return
    }
    lastOpenTimeRef.current = now
    open()
  }, [open])
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
