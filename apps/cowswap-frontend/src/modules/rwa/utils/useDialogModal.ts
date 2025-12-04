import { useCallback, useRef, useState } from 'react'

export interface useDialogModalActions {
  isOpen: boolean
  openModal: () => Promise<boolean>
  onAccept: () => void
  closeModal: () => void
}

export function useDialogModal(): useDialogModalActions {
  const [isOpen, setIsOpen] = useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const openModal = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setIsOpen(true)
    })
  }, [])

  const onAccept = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
    setIsOpen(false)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }, [])

  return {
    isOpen,
    openModal,
    onAccept,
    closeModal,
  }
}
