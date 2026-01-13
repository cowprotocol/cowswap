import { ReactElement } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  OnBridgingSuccessPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
  OnPresignedOrderPayload,
  ToastMessageType,
} from '@cowprotocol/events'
import { IconType } from '@cowprotocol/snackbars'
import { CurrencyAmount } from '@uniswap/sdk-core'

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
      const nativeCurrency = NATIVE_CURRENCIES[payload.inputAmount.currency.chainId as SupportedChainId]

      const payloadFixed: OnPostedOrderPayload = {
        ...payload,
        // Force inputAmount currency override for Safe "Wrap and Swap" case
        inputAmount:
          payload.isEthFlow && nativeCurrency
            ? CurrencyAmount.fromRawAmount(nativeCurrency, payload.inputAmount.quotient.toString())
            : payload.inputAmount,
      }

      return (
        <PostedOrderNotification
          title={t`Order submitted`}
          payload={payloadFixed}
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
