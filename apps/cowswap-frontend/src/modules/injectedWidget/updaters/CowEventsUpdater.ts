import { useEffect } from 'react'

import { CowEventListener, CowEventListeners, CowEventPayloadMap, CowEvents } from '@cowprotocol/events'
import { WidgetMethodsEmit, postMessageToWindow } from '@cowprotocol/widget-lib'

import { EVENT_EMITTER } from 'eventEmitter'

const ALL_EVENTS = Object.values(CowEvents)

export function CowEventsUpdater() {
  // Setup listeners only once
  useEffect(() => {
    // Create all listeners
    const allHandlers: CowEventListeners = ALL_EVENTS.map((event) => {
      return {
        event,
        handler: (payload: any) => {
          console.debug('[CowEventsUpdater] Forward event to iFrame', event, payload)
          forwardEventToIframe(event, payload)
        },
      }
    })
    allHandlers.forEach((listener) => EVENT_EMITTER.on(listener as CowEventListener<CowEvents>))

    // Cleanup: Remove all listeners
    return () => {
      allHandlers.forEach((listener) => EVENT_EMITTER.off(listener as CowEventListener<CowEvents>))
    }
  }, [])

  return null
}

function forwardEventToIframe<T extends CowEvents>(event: CowEvents, payload: CowEventPayloadMap[T]) {
  // console.debug('[injectedWidget:forwardEventToIframe] Forward event', event, payload)
  postMessageToWindow(window.parent, WidgetMethodsEmit.EMIT_COW_EVENT, {
    event,
    payload,
  })
}
