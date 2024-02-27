import {
  CowEventPayloads,
  CowEvents,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
  OnPostedOrderPayload,
  OnPresignedOrderPayload,
  OnToastMessagePayload,
  ToastMessagePayloads,
  ToastMessageType,
} from '@cowprotocol/events'
import { IconType } from '@cowprotocol/snackbars'

import { EVENT_EMITTER } from 'eventEmitter'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { CancelledOrderNotification } from '../../containers/CancelledOrderNotification'
import { ExpiredOrderNotification } from '../../containers/ExpiredOrderNotification'
import { FulfilledOrderNotification } from '../../containers/FulfilledOrderNotification'
import { PendingOrderNotification } from '../../containers/PendingOrderNotification'
import { PresignedOrderNotification } from '../../containers/PresignedOrderNotification'

type OrdersNotificationsHandler = {
  icon: IconType
  handler(payload: CowEventPayloads[keyof CowEventPayloads]): JSX.Element | null
}

export const ORDERS_NOTIFICATION_HANDLERS: Record<CowEvents, OrdersNotificationsHandler> = {
  [CowEvents.ON_POSTED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPostedOrderPayload) => {
      const { orderUid, orderType } = payload

      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_CREATED, {
        orderUid,
        orderType,
      })

      return <PendingOrderNotification payload={payload} onToastMessage={onToastMessage} />
    },
  },
  [CowEvents.ON_FULFILLED_ORDER]: {
    icon: 'success',
    handler: (payload: OnFulfilledOrderPayload) => {
      const { order } = payload

      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_FULFILLED, {
        orderUid: order.uid,
        orderType: getUiOrderType(order),
      })

      return <FulfilledOrderNotification payload={payload} onToastMessage={onToastMessage} />
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
  [CowEvents.ON_EXPIRED_ORDER]: {
    icon: 'alert',
    handler: (payload: OnExpiredOrderPayload) => {
      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_EXPIRED, {
        orderUid: payload.order.uid,
        orderType: getUiOrderType(payload.order),
      })

      return <ExpiredOrderNotification payload={payload} onToastMessage={onToastMessage} />
    },
  },
  [CowEvents.ON_PRESIGNED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPresignedOrderPayload) => {
      const onToastMessage = getToastMessageCallback(ToastMessageType.ORDER_PRESIGNED, {
        orderUid: payload.order.uid,
        orderType: getUiOrderType(payload.order),
      })

      return <PresignedOrderNotification payload={payload} onToastMessage={onToastMessage} />
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
