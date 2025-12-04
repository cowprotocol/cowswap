import { useCallback, useRef, useState } from 'react'

export interface UsePromiseModalReturn {
  isOpen: boolean
  openModal: () => Promise<boolean>
  onAcceptOrReject: (value: boolean) => void
  closeModal: () => void
}

export function usePromiseModal(): UsePromiseModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const openModal = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setIsOpen(true)
    })
  }, [])

  const onAcceptOrReject = useCallback((isAccepted: boolean) => {
    if (resolveRef.current) {
      resolveRef.current(isAccepted)
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
    onAcceptOrReject,
    closeModal,
  }
}
