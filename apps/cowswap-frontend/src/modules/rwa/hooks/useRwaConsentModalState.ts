import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  rwaConsentModalStateAtom,
  updateRwaConsentModalStateAtom,
  RwaConsentModalState,
  RwaConsentModalContext,
} from '../state/rwaConsentModalStateAtom'

export type { RwaConsentModalContext }

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

  return useMemo(
    () => ({
      isModalOpen: state.isModalOpen,
      context: state.context,
      openModal,
      closeModal,
    }),
    [state.isModalOpen, state.context, openModal, closeModal],
  )
}
