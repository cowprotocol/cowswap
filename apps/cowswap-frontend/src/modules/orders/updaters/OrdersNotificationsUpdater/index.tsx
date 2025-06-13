import { useEffect } from 'react'

import { CowWidgetEventListener, CowWidgetEventPayloadMap, CowWidgetEvents } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { ORDERS_NOTIFICATION_HANDLERS } from './handlers'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrdersNotificationsUpdater() {
  const addSnackbar = useAddSnackbar()

  useEffect(() => {
    const listeners = Object.keys(ORDERS_NOTIFICATION_HANDLERS).map((event) => {
      const eventTyped = event as CowWidgetEvents
      return {
        event: eventTyped,
        handler(payload: CowWidgetEventPayloadMap[keyof CowWidgetEventPayloadMap]) {
          const { handler, icon } = ORDERS_NOTIFICATION_HANDLERS[eventTyped]

          const content = handler(payload as Parameters<typeof handler>[0])

          if (!content) return

          addSnackbar({
            id: eventTyped,
            icon,
            content,
          })
        },
      } as CowWidgetEventListener
    })

    listeners.forEach((listener) => WIDGET_EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => WIDGET_EVENT_EMITTER.off(listener))
    }
  }, [addSnackbar])

  return null
}
