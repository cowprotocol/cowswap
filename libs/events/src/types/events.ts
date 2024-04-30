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

export enum CowEvents {
  ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_FULFILLED_ORDER = 'ON_FULFILLED_ORDER',
  ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
  ON_EXPIRED_ORDER = 'ON_EXPIRED_ORDER',
  ON_PRESIGNED_ORDER = 'ON_PRESIGNED_ORDER',
  ON_ONCHAIN_TRANSACTION = 'ON_ONCHAIN_TRANSACTION',
  ON_CHANGE_TRADE_PARAMS = 'ON_CHANGE_TRADE_PARAMS',
}

// Define types for event payloads
export interface CowEventPayloadMap {
  [CowEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload
  [CowEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [CowEvents.ON_FULFILLED_ORDER]: OnFulfilledOrderPayload
  [CowEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload
  [CowEvents.ON_EXPIRED_ORDER]: OnExpiredOrderPayload
  [CowEvents.ON_PRESIGNED_ORDER]: OnPresignedOrderPayload
  [CowEvents.ON_ONCHAIN_TRANSACTION]: OnTransactionPayload
  [CowEvents.ON_CHANGE_TRADE_PARAMS]: OnTradeParamsPayload
}

export type CowEventPayloads = CowEventPayloadMap[CowEvents]
