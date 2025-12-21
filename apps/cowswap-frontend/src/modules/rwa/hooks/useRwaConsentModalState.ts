import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import {
  rwaConsentModalStateAtom,
  updateRwaConsentModalStateAtom,
  RwaConsentModalContext,
  RwaConsentModalState,
} from '../state/rwaConsentModalStateAtom'

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
