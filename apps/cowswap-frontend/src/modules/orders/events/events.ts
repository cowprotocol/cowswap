import {
  CowEventListener,
  OnBridgingSuccessPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
  OnPresignedOrderPayload,
  OnPostedOrderPayload as GenericOnPostedOrderPayload,
} from '@cowprotocol/events'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export enum OrderStatusEvents {
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_FULFILLED_ORDER = 'ON_FULFILLED_ORDER',
  ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
  ON_EXPIRED_ORDER = 'ON_EXPIRED_ORDER',
  ON_PRESIGNED_ORDER = 'ON_PRESIGNED_ORDER',
  ON_BRIDGING_SUCCESS = 'ON_BRIDGING_SUCCESS',
}

export type OnPostedOrderPayload = {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  orderDetails: GenericOnPostedOrderPayload
}

// Define types for event payloads
export interface OrderStatusEventPayloadMap {
  [OrderStatusEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [OrderStatusEvents.ON_FULFILLED_ORDER]: OnFulfilledOrderPayload
  [OrderStatusEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload
  [OrderStatusEvents.ON_EXPIRED_ORDER]: OnExpiredOrderPayload
  [OrderStatusEvents.ON_PRESIGNED_ORDER]: OnPresignedOrderPayload
  [OrderStatusEvents.ON_BRIDGING_SUCCESS]: OnBridgingSuccessPayload
}

export type OrderStatusPayloads = OrderStatusEventPayloadMap[OrderStatusEvents]

export type OrderStatusEventListener = CowEventListener<OrderStatusEventPayloadMap, OrderStatusEvents>
export type OrderStatusEventListeners = OrderStatusEventListener[]
