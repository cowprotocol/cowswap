import { ReactElement } from 'react'

import {
  CowEventPayloads,
  CowWidgetEvents,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
  OnPostedOrderPayload,
  OnPresignedOrderPayload,
  ToastMessageType,
} from '@cowprotocol/events'
import { IconType } from '@cowprotocol/snackbars'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { FulfilledOrderInfo } from '../../containers/FulfilledOrderInfo'
import { OrderNotification } from '../../containers/OrderNotification'

type OrdersNotificationsHandler = {
  icon: IconType
  handler(payload: CowEventPayloads[keyof CowEventPayloads]): ReactElement | null
}

export const ORDERS_NOTIFICATION_HANDLERS: Record<CowWidgetEvents, OrdersNotificationsHandler> = {
  [CowWidgetEvents.ON_POSTED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPostedOrderPayload) => {
      const { chainId, orderUid, orderType, orderCreationHash, isEthFlow } = payload

      return (
        <OrderNotification
          title="Order submitted"
          chainId={chainId}
          orderType={orderType}
          orderUid={orderUid}
          orderInfo={payload}
          transactionHash={orderCreationHash}
          isEthFlow={isEthFlow}
          messageType={ToastMessageType.ORDER_CREATED}
        />
      )
    },
  },
  [CowWidgetEvents.ON_FULFILLED_ORDER]: {
    icon: 'success',
    handler: (payload: OnFulfilledOrderPayload) => {
      const { chainId, order } = payload

      return (
        <OrderNotification
          title="Order filled"
          chainId={chainId}
          orderType={getUiOrderType(order)}
          orderUid={order.uid}
          messageType={ToastMessageType.ORDER_FULFILLED}
        >
          <FulfilledOrderInfo chainId={chainId} orderUid={order.uid} />
        </OrderNotification>
      )
    },
  },
  [CowWidgetEvents.ON_CANCELLED_ORDER]: {
    icon: 'success',
    handler: (payload: OnCancelledOrderPayload) => {
      const { chainId, order, transactionHash } = payload

      return (
        <OrderNotification
          title="Order cancelled"
          chainId={chainId}
          orderInfo={order}
          orderType={getUiOrderType(order)}
          orderUid={order.uid}
          transactionHash={transactionHash}
          messageType={ToastMessageType.ORDER_CANCELLED}
        />
      )
    },
  },
  [CowWidgetEvents.ON_EXPIRED_ORDER]: {
    icon: 'alert',
    handler: (payload: OnExpiredOrderPayload) => {
      const { chainId, order } = payload

      return (
        <OrderNotification
          title="Order expired"
          chainId={chainId}
          orderType={getUiOrderType(order)}
          orderUid={order.uid}
          messageType={ToastMessageType.ORDER_EXPIRED}
        />
      )
    },
  },
  [CowWidgetEvents.ON_PRESIGNED_ORDER]: {
    icon: 'success',
    handler: (payload: OnPresignedOrderPayload) => {
      const { chainId, order } = payload

      return (
        <OrderNotification
          title="Order presigned"
          chainId={chainId}
          orderType={getUiOrderType(order)}
          orderUid={order.uid}
          messageType={ToastMessageType.ORDER_PRESIGNED}
        />
      )
    },
  },
  [CowWidgetEvents.ON_TOAST_MESSAGE]: {
    icon: 'success',
    handler: (info) => {
      console.debug('[ON_TOAST_MESSAGE]', info)
      return null
    },
  },
  [CowWidgetEvents.ON_ONCHAIN_TRANSACTION]: {
    icon: 'success',
    handler: () => {
      // Handled in OnchainTransactionEventsUpdater
      return null
    },
  },
  [CowWidgetEvents.ON_CHANGE_TRADE_PARAMS]: {
    icon: 'success',
    handler: () => null,
  },
}
