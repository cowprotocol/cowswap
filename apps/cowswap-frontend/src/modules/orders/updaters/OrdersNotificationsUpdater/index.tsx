import { useEffect } from 'react'

import { CowEventListener, CowEvents } from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { EVENT_EMITTER } from 'eventEmitter'

import { FulfilledOrderNotification } from '../../containers/FulfilledOrderNotification'
import { getPendingOrderNotificationToast, PendingOrderNotification } from '../../pure/PendingOrderNotification'
import { getPendingOrderNotificationProps } from '../../pure/PendingOrderNotification/getPendingOrderNotificationProps'

export function OrdersNotificationsUpdater() {
  const addSnackbar = useAddSnackbar()
  const isSafeWallet = useIsSafeWallet()

  useEffect(() => {
    const postedOrderListener: CowEventListener<CowEvents.ON_POSTED_ORDER> = {
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

    const fulfilledOrderListener: CowEventListener<CowEvents.ON_FULFILLED_ORDER> = {
      event: CowEvents.ON_FULFILLED_ORDER,
      handler({ order, chainId }) {
        const content = <FulfilledOrderNotification chainId={chainId} uid={order.uid} />

        // TODO: add toast message
        // EVENT_EMITTER.emit(CowEvents.ON_TOAST_MESSAGE, toastMessage)

        addSnackbar({
          id: 'fulfilled-order',
          icon: 'success',
          content,
        })
      },
    }

    const listeners = [postedOrderListener, fulfilledOrderListener]

    listeners.forEach((listener) => EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => EVENT_EMITTER.off(listener))
    }
  }, [isSafeWallet, addSnackbar])

  return null
}
