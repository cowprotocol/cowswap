import { useEffect } from 'react'

import {
  CowWidgetEventListener,
  CowWidgetEventListeners,
  CowWidgetEventPayloadMap,
  CowWidgetEvents,
} from '@cowprotocol/events'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { widgetIframeTransport, WidgetMethodsEmit } from '@cowprotocol/widget-lib'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

const ALL_EVENTS = Object.values(CowWidgetEvents)

export function CowEventsUpdater(): null {
  // Setup listeners only once
  useEffect(() => {
    // Create all listeners
    const allHandlers: CowWidgetEventListeners = ALL_EVENTS.map((event) => {
      return {
        event,
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: (payload: any) => forwardEventToIframe(event, payload),
      }
    })
    allHandlers.forEach((listener) => WIDGET_EVENT_EMITTER.on(listener as CowWidgetEventListener))

    // Cleanup: Remove all listeners
    return () => {
      allHandlers.forEach((listener) => WIDGET_EVENT_EMITTER.off(listener as CowWidgetEventListener))
    }
  }, [])

  return null
}

function forwardEventToIframe<T extends CowWidgetEvents>(
  event: CowWidgetEvents,
  payload: CowWidgetEventPayloadMap[T],
): void {
  const parentOrigin = getParentOrigin()

  if (!parentOrigin) return

  widgetIframeTransport.postMessageToWindow(
    window.parent,
    WidgetMethodsEmit.EMIT_COW_EVENT,
    {
      event,
      payload,
    },
    parentOrigin,
  )
}
