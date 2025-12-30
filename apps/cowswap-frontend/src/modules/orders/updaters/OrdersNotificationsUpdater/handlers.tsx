import { ReactElement } from 'react'

import {
  OnBridgingSuccessPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
  OnPresignedOrderPayload,
  ToastMessageType,
} from '@cowprotocol/events'
import { IconType } from '@cowprotocol/snackbars'

import { t } from '@lingui/core/macro'

import { BridgingSuccessNotification } from '../../containers/BridgingSuccessNotification'
import { FulfilledOrderInfo } from '../../containers/FulfilledOrderInfo'
import { OrderNotification } from '../../containers/OrderNotification'
import { PostedOrderNotification } from '../../containers/PostedOrderNotification'
import { OnPostedOrderPayload, OrderStatusEvents, OrderStatusPayloads } from '../../events/events'

type OrdersNotificationsHandler = {
  icon: IconType
  handler(payload: OrderStatusPayloads): ReactElement | null
}

export const ORDERS_NOTIFICATION_HANDLERS: Record<OrderStatusEvents, OrdersNotificationsHandler> = {
  [OrderStatusEvents.ON_POSTED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPostedOrderPayload) => {
      return (
        <PostedOrderNotification
          title={t`Order submitted`}
          payload={payload}
          messageType={ToastMessageType.ORDER_CREATED}
        />
      )
    },
  },
  [OrderStatusEvents.ON_FULFILLED_ORDER]: {
    icon: 'success',
    handler: (payload: OnFulfilledOrderPayload) => {
      const { chainId, order, bridgeOrder } = payload

      return (
        <OrderNotification
          title={bridgeOrder ? t`Swap order filled` : t`Order filled`}
          chainId={chainId}
          orderUid={order.uid}
          hideReceiver={!!bridgeOrder}
          messageType={ToastMessageType.ORDER_FULFILLED}
        >
          <FulfilledOrderInfo chainId={chainId} orderUid={order.uid} />
        </OrderNotification>
      )
    },
  },
  [OrderStatusEvents.ON_CANCELLED_ORDER]: {
    icon: 'success',
    handler: (payload: OnCancelledOrderPayload) => {
      const { chainId, order, transactionHash } = payload

      return (
        <OrderNotification
          title={t`Order cancelled`}
          chainId={chainId}
          orderUid={order.uid}
          transactionHash={transactionHash}
          messageType={ToastMessageType.ORDER_CANCELLED}
          hideReceiver
        />
      )
    },
  },
  [OrderStatusEvents.ON_EXPIRED_ORDER]: {
    icon: 'alert',
    handler: (payload: OnExpiredOrderPayload) => {
      const { chainId, order } = payload

      return (
        <OrderNotification
          title={t`Order expired`}
          chainId={chainId}
          orderUid={order.uid}
          messageType={ToastMessageType.ORDER_EXPIRED}
          hideReceiver
        />
      )
    },
  },
  [OrderStatusEvents.ON_PRESIGNED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPresignedOrderPayload) => {
      const { chainId, order } = payload

      return (
        <OrderNotification
          title={t`Order presigned`}
          chainId={chainId}
          orderUid={order.uid}
          messageType={ToastMessageType.ORDER_PRESIGNED}
        />
      )
    },
  },
  [OrderStatusEvents.ON_BRIDGING_SUCCESS]: {
    icon: 'success',
    handler: (payload: OnBridgingSuccessPayload) => {
      return <BridgingSuccessNotification payload={payload} />
    },
  },
}
