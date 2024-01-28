import { useState } from 'react'

export interface ModalState<T> {
  isModalOpen: boolean
  openModal: (context?: T) => void
  closeModal: () => void
  context?: T
}

export function useModalState<T>(): ModalState<T> {
  const [context, setContext] = useState<T | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (context?: T) => {
    setIsModalOpen(true)
    setContext(context)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setContext(undefined)
  }

  return { isModalOpen, context, openModal, closeModal }
}
