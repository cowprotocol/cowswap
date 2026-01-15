import { useEffect } from 'react'

import { useAddSnackbar } from '@cowprotocol/snackbars'

import { ORDERS_NOTIFICATION_HANDLERS } from './handlers'

import { OrderStatusEventListener, OrderStatusEventPayloadMap, OrderStatusEvents } from '../../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../../events/orderStatusEventEmitter'

export function OrdersNotificationsUpdater(): null {
  const addSnackbar = useAddSnackbar()

  useEffect(() => {
    const listeners = Object.keys(ORDERS_NOTIFICATION_HANDLERS).map((event) => {
      const eventTyped = event as OrderStatusEvents
      return {
        event: eventTyped,
        handler(payload: OrderStatusEventPayloadMap[keyof OrderStatusEventPayloadMap]) {
          const { handler, icon } = ORDERS_NOTIFICATION_HANDLERS[eventTyped]

          const content = handler(payload as Parameters<typeof handler>[0])

          if (!content) return

          addSnackbar({
            id: eventTyped,
            icon,
            content,
          })
        },
      } as OrderStatusEventListener
    })

    listeners.forEach((listener) => ORDER_STATUS_EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => ORDER_STATUS_EVENT_EMITTER.off(listener))
    }
  }, [addSnackbar])

  return null
}
