import { useEffect } from 'react'

import { CowEventListener, CowEventPayloadMap, CowEvents } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { EVENT_EMITTER } from 'eventEmitter'

import { ORDERS_NOTIFICATION_HANDLERS } from './handlers'

export function OrdersNotificationsUpdater() {
  const addSnackbar = useAddSnackbar()

  useEffect(() => {
    const listeners = Object.keys(ORDERS_NOTIFICATION_HANDLERS).map((event) => {
      const eventTyped = event as CowEvents
      return {
        event: eventTyped,
        handler(payload: CowEventPayloadMap[keyof CowEventPayloadMap]) {
          const { handler, icon } = ORDERS_NOTIFICATION_HANDLERS[eventTyped]

          const content = handler(payload as Parameters<typeof handler>[0])

          if (!content) return

          addSnackbar({
            id: eventTyped,
            icon,
            content,
          })
        },
      } as CowEventListener<CowEvents>
    })

    listeners.forEach((listener) => EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => EVENT_EMITTER.off(listener))
    }
  }, [addSnackbar])

  return null
}
