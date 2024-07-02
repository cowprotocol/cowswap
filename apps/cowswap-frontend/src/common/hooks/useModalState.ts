import { useCallback, useEffect, useMemo, useState } from 'react'

import { Command } from '@cowprotocol/types'
export interface ModalState<T> {
  isModalOpen: boolean
  openModal: (context?: T) => void
  closeModal: Command
  context?: T
}

export function useModalState<T>(trigger?: boolean): ModalState<T> {
  const [context, setContext] = useState<T | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = useCallback((context?: T) => {
    setIsModalOpen(true)
    setContext(context)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setContext(undefined)
  }, [])

  useEffect(() => {
    if (trigger === undefined) return

    if (trigger) {
      openModal()
    } else {
      closeModal()
    }
  }, [trigger, openModal, closeModal])

  return useMemo(() => ({ isModalOpen, context, openModal, closeModal }), [isModalOpen, context, openModal, closeModal])
}
