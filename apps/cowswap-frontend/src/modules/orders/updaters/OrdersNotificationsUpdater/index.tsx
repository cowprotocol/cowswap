import { useEffect, useRef } from 'react'

import { OnFulfilledOrderPayload } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { ORDERS_NOTIFICATION_HANDLERS } from './handlers'

import { OrderStatusEventListener, OrderStatusEventPayloadMap, OrderStatusEvents } from '../../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../../events/orderStatusEventEmitter'

export function OrdersNotificationsUpdater(): null {
  const addSnackbar = useAddSnackbar()
  const seenFulfilledNotifications = useRef<Set<string>>(new Set())

  useEffect(() => {
    const listeners = Object.keys(ORDERS_NOTIFICATION_HANDLERS).map((event) => {
      const eventTyped = event as OrderStatusEvents
      return {
        event: eventTyped,
        handler(payload: OrderStatusEventPayloadMap[keyof OrderStatusEventPayloadMap]) {
          const notificationId = getNotificationId(eventTyped, payload)

          if (notificationId && seenFulfilledNotifications.current.has(notificationId)) {
            return
          }

          const { handler, icon } = ORDERS_NOTIFICATION_HANDLERS[eventTyped]

          const content = handler(payload as Parameters<typeof handler>[0])

          if (!content) return

          if (notificationId) {
            seenFulfilledNotifications.current.add(notificationId)
          }

          addSnackbar({
            id: notificationId || eventTyped,
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

function getNotificationId(
  event: OrderStatusEvents,
  payload: OrderStatusEventPayloadMap[keyof OrderStatusEventPayloadMap],
): string | null {
  if (event !== OrderStatusEvents.ON_FULFILLED_ORDER) {
    return null
  }

  const { chainId, order } = payload as OnFulfilledOrderPayload

  return `${event}:${chainId}:${order.uid}`
}
