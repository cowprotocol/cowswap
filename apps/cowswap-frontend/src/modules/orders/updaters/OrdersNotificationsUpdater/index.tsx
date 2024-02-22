import { useEffect } from 'react'

import { CowEventListener, CowEvents } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { EVENT_EMITTER } from 'eventEmitter'

import { PendingOrderNotification } from 'common/pure/PendingOrderNotification'

import { getPendingOrderNotificationProps } from './getPendingOrderNotificationProps'

export function OrdersNotificationsUpdater() {
  const addSnackbar = useAddSnackbar()
  const isSafeWallet = useIsSafeWallet()

  useEffect(() => {
    const listener: CowEventListener<CowEvents.ON_POSTED_ORDER> = {
      event: CowEvents.ON_POSTED_ORDER,
      handler(payload) {
        const content = <PendingOrderNotification {...getPendingOrderNotificationProps(payload, isSafeWallet)} />

        addSnackbar({
          id: 'pending-order',
          icon: 'success',
          content,
        })
      },
    }

    EVENT_EMITTER.on(listener)

    return () => {
      EVENT_EMITTER.off(listener)
    }
  }, [isSafeWallet, addSnackbar])

  return null
}
