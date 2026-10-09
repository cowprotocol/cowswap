import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { solanaAlphaRiskModalOpenAtom } from '../state/solanaAlphaRiskModalAtom'

export interface SolanaAlphaRiskModalState {
  isOpen: boolean
  openModal: Command
  closeModal: Command
}

export function useSolanaAlphaRiskModal(): SolanaAlphaRiskModalState {
  const [isOpen, setIsOpen] = useAtom(solanaAlphaRiskModalOpenAtom)

  const openModal = useCallback(() => setIsOpen(true), [setIsOpen])
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen])

  return { isOpen, openModal, closeModal }
}
