import { useEffect, useMemo } from 'react'

import { CowEventListener, CowEventPayloadMap, CowEvents } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { EVENT_EMITTER } from 'eventEmitter'

import { ORDERS_NOTIFICATION_HANDLERS } from './handlers'
import { OrdersNotificationsContext } from './types'

export function OrdersNotificationsUpdater() {
  const addSnackbar = useAddSnackbar()
  const isSafeWallet = useIsSafeWallet()
  const context: OrdersNotificationsContext = useMemo(() => {
    return { isSafeWallet }
  }, [isSafeWallet])

  useEffect(() => {
    const listeners = Object.keys(ORDERS_NOTIFICATION_HANDLERS).map((event) => {
      const eventTyped = event as CowEvents
      return {
        event: eventTyped,
        handler(payload: CowEventPayloadMap[keyof CowEventPayloadMap]) {
          const { handler, icon } = ORDERS_NOTIFICATION_HANDLERS[eventTyped]

          const content = handler(payload as Parameters<typeof handler>[0], context)

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
  }, [context, addSnackbar])

  return null
}
