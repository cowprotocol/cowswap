import { useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

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

// TODO: These two seem to be gone from original. Check whether they have been replaced
export function useOpenModal(modal: ApplicationModal): Command {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): Command {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}
