import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  BaseToastMessagePayload,
  CowWidgetEventListeners,
  CowWidgetEvents,
  ToastMessageType,
} from '@cowprotocol/events'

import { COW_LISTENERS } from '../configurator.constants'

export interface UseToastsManagerReturn {
  disableToastMessages: boolean
  setToastMessagesInDappMode: (enabled: boolean) => void
  toasts: (ReactElement | string)[]
  closeToast: () => void
}

// TODO: Break down this large function into smaller functions
export function useToastsManager(setListeners: (listeners: CowWidgetEventListeners) => void): UseToastsManagerReturn {
  const isInitRef = useRef(false)
  const [disableToastMessages, setDisableToastMessages] = useState<boolean>(false)
  const [toasts, setToasts] = useState<(ReactElement | string)[]>([])

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const openToast = (message: ReactElement | string) => {
    setToasts((t) => [...t, message])
  }

  const closeToast = useCallback(() => {
    setToasts((t) => t.slice(1))
  }, [])

  const setToastMessagesInDappMode = useCallback(
    (enabled: boolean) => {
      closeToast()
      setDisableToastMessages(enabled)
    },
    [closeToast],
  )

  useEffect(() => {
    if (!isInitRef.current) {
      isInitRef.current = true
      return
    }

    // Update listeners
    const newListeners = [...COW_LISTENERS]
    if (disableToastMessages) {
      openToast('Toast messages are enabled. Using Dapp mode toasts.')
      newListeners.push({
        event: CowWidgetEvents.ON_TOAST_MESSAGE,
        handler: (event: BaseToastMessagePayload<ToastMessageType>) => {
          // You can provide a simplistic way to handle toast messages (use the "message" to show it in your app)
          const prettyMessage = (
            <>
              {event.message.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </>
          )
          openToast(prettyMessage)
        },
      })
    } else {
      openToast('Toast messages are disabled. Self-contained widget toasts.')
    }

    setListeners(newListeners)
  }, [disableToastMessages, setListeners])

  return useMemo(() => {
    return {
      disableToastMessages,
      setToastMessagesInDappMode,
      toasts,
      closeToast,
    }
  }, [disableToastMessages, toasts, closeToast, setToastMessagesInDappMode])
}
