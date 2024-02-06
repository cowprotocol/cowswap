import { OnExecutedOrderPayload, OnPostedOrderPayload, OnRejectedOrderPayload } from './orders'
import { OnToastMessagePayload } from './toastMessages'

// export type CowEvents = 'updateWidgetConfig' | 'onToastMessage' | 'onPostedOrder' | 'onExecutedOrder'
export enum CowEvents {
  ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_EXECUTED_ORDER = 'ON_EXECUTED_ORDER',
  ON_REJECTED_ORDER = 'ON_REJECTED_ORDER',
}

// Define types for event payloads
export interface EventPayloads {
  [CowEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload
  [CowEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [CowEvents.ON_EXECUTED_ORDER]: OnExecutedOrderPayload
  [CowEvents.ON_REJECTED_ORDER]: OnRejectedOrderPayload
}
