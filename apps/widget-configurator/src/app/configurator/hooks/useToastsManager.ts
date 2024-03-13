import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { BaseToastMessagePayload, CowEventListeners, CowEvents, ToastMessageType } from '@cowprotocol/events'

import { COW_LISTENERS } from '../consts'

export function useToastsManager(setListeners: (listeners: CowEventListeners) => void) {
  const [disableToastMessages, setDisableToastMessages] = useState<boolean>(false)
  const [toasts, setToasts] = useState<string[]>([])

  const openToast = (message: string) => {
    setToasts((t) => [...t, message])
  }

  const closeToast = useCallback((_: unknown, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setToasts((t) => t.slice(1))
  }, [])

  const selectDisableToastMessages = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      closeToast(undefined)
      setDisableToastMessages(event.target.value === 'true')
    },
    [closeToast]
  )

  useEffect(() => {
    // Update listeners
    const newListeners = [...COW_LISTENERS]
    if (disableToastMessages) {
      openToast('Toast messages are enabled. Using Dapp mode toasts.')
      newListeners.push({
        event: CowEvents.ON_TOAST_MESSAGE,
        handler: (event: BaseToastMessagePayload<ToastMessageType>) => {
          // You can provide a simplistic way to handle toast messages (use the "message" to show it in your app)
          openToast(event.message)
        },
      })
    } else {
      openToast('Disable, toast messages. Self-contained widget toasts.')
    }

    setListeners(newListeners)
  }, [disableToastMessages])

  return useMemo(() => {
    return {
      disableToastMessages,
      selectDisableToastMessages,
      toasts,
      closeToast,
    }
  }, [disableToastMessages, toasts, closeToast, selectDisableToastMessages])
}
