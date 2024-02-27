import {
  CowEventPayloads,
  CowEvents,
  OnCancelledOrderPayload,
  OnFulfilledOrderPayload,
  OnPostedOrderPayload,
  OnToastMessagePayload,
  ToastMessagePayloads,
  ToastMessageType,
} from '@cowprotocol/events'
import { IconType } from '@cowprotocol/snackbars'

import { EVENT_EMITTER } from 'eventEmitter'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrdersNotificationsContext } from './types'

import { CancelledOrderNotification } from '../../containers/CancelledOrderNotification'
import { FulfilledOrderNotification } from '../../containers/FulfilledOrderNotification'
import { PendingOrderNotification } from '../../pure/PendingOrderNotification'

type OrdersNotificationsHandler<C> = {
  icon: IconType
  handler(payload: CowEventPayloads[keyof CowEventPayloads], context: C): JSX.Element | null
}

export const ORDERS_NOTIFICATION_HANDLERS: Record<CowEvents, OrdersNotificationsHandler<OrdersNotificationsContext>> = {
  [CowEvents.ON_POSTED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPostedOrderPayload, context: OrdersNotificationsContext) => {
      const { orderUid, orderType } = payload

      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_CREATED, {
        orderUid,
        orderType,
      })

      return (
        <PendingOrderNotification
          payload={payload}
          isSafeWallet={context.isSafeWallet}
          onToastMessage={onToastMessage}
        />
      )
    },
  },
  [CowEvents.ON_FULFILLED_ORDER]: {
    icon: 'success',
    handler: ({ order, chainId }: OnFulfilledOrderPayload) => {
      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_FULFILLED, {
        orderUid: order.uid,
        orderType: getUiOrderType(order),
      })

      return <FulfilledOrderNotification chainId={chainId} uid={order.uid} onToastMessage={onToastMessage} />
    },
  },
  [CowEvents.ON_CANCELLED_ORDER]: {
    icon: 'success',
    handler: (payload: OnCancelledOrderPayload) => {
      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_CANCELLED, {
        orderUid: payload.order.uid,
        orderType: getUiOrderType(payload.order),
      })

      return <CancelledOrderNotification payload={payload} onToastMessage={onToastMessage} />
    },
  },
  [CowEvents.ON_TOAST_MESSAGE]: {
    icon: 'success',
    handler: (info) => {
      console.debug('[ON_TOAST_MESSAGE]', info)
      return null
    },
  },
}

function getToastMessageCallback(
  messageType: ToastMessageType,
  data: ToastMessagePayloads[typeof messageType]
): (toastMessage: string) => void {
  return (toastMessage: string) => {
    const payload = {
      messageType,
      message: toastMessage,
      data,
    }

    EVENT_EMITTER.emit(CowEvents.ON_TOAST_MESSAGE, payload as OnToastMessagePayload)
  }
}
