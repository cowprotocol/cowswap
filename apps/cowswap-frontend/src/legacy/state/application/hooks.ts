import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'
import { OPEN_WALLET_MODAL_EVENT } from '@cowprotocol/wallet'

import { createAction } from '@reduxjs/toolkit'

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

/**
 * Dispatches OPEN_WALLET_MODAL_EVENT so a listener inside Web3Provider runs reconnect then opens the AppKit modal.
 * No wagmi/Reown hooks here so this is safe to call from any part of the tree.
 */
export function useToggleWalletModal(): Command {
  return useCallback(() => {
    document.dispatchEvent(new CustomEvent(OPEN_WALLET_MODAL_EVENT))
  }, [])
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
