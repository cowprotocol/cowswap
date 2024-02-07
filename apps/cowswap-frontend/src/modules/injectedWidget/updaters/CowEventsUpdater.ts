import { useEffect } from 'react'

import { CowEventListener, CowEventListeners, CowEvents } from '@cowprotocol/events'

import { useCowEventEmitter } from 'common/hooks/useCowEventEmitter'

import { COW_SWAP_WIDGET_EVENT_KEY } from '../consts'

const TARGET_ORIGIN = '*' // Change to CoW specific origin in production

const ALL_EVENTS = Object.values(CowEvents)

export function CowEventsUpdater() {
  const cowEventEmitter = useCowEventEmitter()

  // Setup listeners only once
  useEffect(() => {
    // cowEventEmitter.on(CowEvents)
    const allHandlers: CowEventListeners = ALL_EVENTS.map((event) => {
      return {
        event,
        handler: (payload: any) => forwardEventToIframe(event, payload),
      }
    })

    allHandlers.forEach((listener) => cowEventEmitter.on(listener as CowEventListener<CowEvents>))

    // Cleanup: Remove all listeners
    return () => {
      allHandlers.forEach((listener) => cowEventEmitter.off(listener as CowEventListener<CowEvents>))
    }
  }, [])

  return null
}

function forwardEventToIframe(event: CowEvents, payload: any) {
  window.parent.postMessage(
    {
      key: COW_SWAP_WIDGET_EVENT_KEY,
      method: 'event',
      eventName: event,
      payload,
    },
    TARGET_ORIGIN
  )
}
