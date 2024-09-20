import {
  OnFulfilledOrderPayload,
  OnPostedOrderPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnPresignedOrderPayload,
} from './orders'
import { OnToastMessagePayload } from './toastMessages'
import { OnTradeParamsPayload } from './trade'
import { OnTransactionPayload } from './transactions'

export enum CowWidgetEvents {
  // Toasts
  ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',

  // Orders
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_FULFILLED_ORDER = 'ON_FULFILLED_ORDER',
  ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
  ON_EXPIRED_ORDER = 'ON_EXPIRED_ORDER',
  ON_PRESIGNED_ORDER = 'ON_PRESIGNED_ORDER',
  ON_ONCHAIN_TRANSACTION = 'ON_ONCHAIN_TRANSACTION',
  ON_CHANGE_TRADE_PARAMS = 'ON_CHANGE_TRADE_PARAMS',
}

// Define types for event payloads
export interface CowWidgetEventPayloadMap {
  [CowWidgetEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload
  [CowWidgetEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [CowWidgetEvents.ON_FULFILLED_ORDER]: OnFulfilledOrderPayload
  [CowWidgetEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload
  [CowWidgetEvents.ON_EXPIRED_ORDER]: OnExpiredOrderPayload
  [CowWidgetEvents.ON_PRESIGNED_ORDER]: OnPresignedOrderPayload
  [CowWidgetEvents.ON_ONCHAIN_TRANSACTION]: OnTransactionPayload
  [CowWidgetEvents.ON_CHANGE_TRADE_PARAMS]: OnTradeParamsPayload
}

export type CowEventPayloads = CowWidgetEventPayloadMap[CowWidgetEvents]
