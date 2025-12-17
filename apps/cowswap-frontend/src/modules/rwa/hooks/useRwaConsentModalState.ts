import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import {
  rwaConsentModalStateAtom,
  updateRwaConsentModalStateAtom,
  RwaConsentModalState,
} from '../state/rwaConsentModalStateAtom'

export interface RwaConsentModalContext {
  issuerName: string
  tosHash: string
  token?: TokenWithLogo
}

export function useRwaConsentModalState(): {
  isModalOpen: boolean
  context: RwaConsentModalState['context']
  openModal: (context: RwaConsentModalContext) => void
  closeModal: () => void
} {
  const state = useAtomValue(rwaConsentModalStateAtom)
  const updateState = useSetAtom(updateRwaConsentModalStateAtom)

  const openModal = useCallback(
    (context: RwaConsentModalContext): void => {
      if (state.isModalOpen) {
        return
      }
      updateState({
        isModalOpen: true,
        context,
      })
    },
    [updateState, state.isModalOpen],
  )

  const closeModal = useCallback((): void => {
    updateState({
      isModalOpen: false,
      context: undefined,
    })
  }, [updateState])

  return {
    isModalOpen: state.isModalOpen,
    context: state.context,
    openModal,
    closeModal,
  }
}

