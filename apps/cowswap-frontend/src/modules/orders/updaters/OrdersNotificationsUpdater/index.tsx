import { useEffect } from 'react'

import { CowEventListener, CowEvents } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { EVENT_EMITTER } from 'eventEmitter'

import { getPendingOrderNotificationToast, PendingOrderNotification } from '../../pure/PendingOrderNotification'
import { getPendingOrderNotificationProps } from '../../pure/PendingOrderNotification/getPendingOrderNotificationProps'

export function OrdersNotificationsUpdater() {
  const addSnackbar = useAddSnackbar()
  const isSafeWallet = useIsSafeWallet()

  useEffect(() => {
    const listener: CowEventListener<CowEvents.ON_POSTED_ORDER> = {
      event: CowEvents.ON_POSTED_ORDER,
      handler(payload) {
        const props = getPendingOrderNotificationProps(payload, isSafeWallet)
        const toastMessage = getPendingOrderNotificationToast(props)

        const content = <PendingOrderNotification {...props} />

        EVENT_EMITTER.emit(CowEvents.ON_TOAST_MESSAGE, toastMessage)

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
