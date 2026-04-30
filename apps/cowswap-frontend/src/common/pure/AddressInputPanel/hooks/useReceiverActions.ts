import { useCallback, useEffect, useState } from 'react'

export interface ReceiverActions {
  handlePaste(): void
  handleClear(): void
  handleScan(result: string): void
  showQrModal: boolean
  setShowQrModal(v: boolean): void
  canPaste: boolean
}

export function useReceiverActions(onChange: (value: string) => void): ReceiverActions {
  const [showQrModal, setShowQrModal] = useState(false)
  const [canPaste, setCanPaste] = useState(true)

  useEffect(() => {
    if (!navigator.clipboard) {
      setCanPaste(false)
      return
    }

    navigator.permissions
      .query({ name: 'clipboard-read' as PermissionName })
      .then((result) => {
        setCanPaste(result.state !== 'denied')
      })
      .catch(() => {
        // Permissions API unavailable — keep optimistic default
      })
  }, [])

  const handlePaste = useCallback(() => {
    navigator.clipboard
      .readText()
      .then(onChange)
      .catch((e: unknown) => console.error('Clipboard read failed', e))
  }, [onChange])

  const handleClear = useCallback(() => onChange(''), [onChange])

  const handleScan = useCallback(
    (result: string) => {
      onChange(result)
      setShowQrModal(false)
    },
    [onChange],
  )

  return { handlePaste, handleClear, handleScan, showQrModal, setShowQrModal, canPaste }
}
