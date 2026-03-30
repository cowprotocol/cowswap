import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import {
  CowEventListener,
  OnBridgingSuccessPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
  OnPresignedOrderPayload,
  OnPostedOrderPayload as GenericOnPostedOrderPayload,
  BaseOrderPayload,
} from '@cowprotocol/events'

export type OnPostedOrderPayload = {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  orderDetails: GenericOnPostedOrderPayload
  isEthFlow?: boolean
}

export type OrderStatusEventListener = CowEventListener<OrderStatusEventPayloadMap, OrderStatusEvents>

export type OrderStatusEventListeners = OrderStatusEventListener[]

// Define types for event payloads
export interface OrderStatusEventPayloadMap {
  [OrderStatusEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [OrderStatusEvents.ON_PENDING_ORDER]: BaseOrderPayload
  [OrderStatusEvents.ON_FULFILLED_ORDER]: OnFulfilledOrderPayload
  [OrderStatusEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload
  [OrderStatusEvents.ON_EXPIRED_ORDER]: OnExpiredOrderPayload
  [OrderStatusEvents.ON_PRESIGNED_ORDER]: OnPresignedOrderPayload
  [OrderStatusEvents.ON_BRIDGING_SUCCESS]: OnBridgingSuccessPayload
}

export type OrderStatusPayloads = OrderStatusEventPayloadMap[OrderStatusEvents]
export enum OrderStatusEvents {
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_PENDING_ORDER = 'ON_PENDING_ORDER',
  ON_FULFILLED_ORDER = 'ON_FULFILLED_ORDER',
  ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
  ON_EXPIRED_ORDER = 'ON_EXPIRED_ORDER',
  ON_PRESIGNED_ORDER = 'ON_PRESIGNED_ORDER',
  ON_BRIDGING_SUCCESS = 'ON_BRIDGING_SUCCESS',
}
