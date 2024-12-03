import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

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

export function useToggleWalletModal(): Command {
  return useToggleModal(ApplicationModal.WALLET)
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
