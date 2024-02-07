import {
  OnExecutedOrderPayload,
  OnPostedOrderPayload,
  OnRejectedOrderPayload as OnCancelledOrderPayload,
  OnPostedEthFlowOrderPayload,
} from './orders'
import { OnToastMessagePayload } from './toastMessages'

// export type CowEvents = 'updateWidgetConfig' | 'onToastMessage' | 'onPostedOrder' | 'onExecutedOrder'
export enum CowEvents {
  ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_POSTED_ETH_FLOW_ORDER = 'ON_POSTED_ETH_FLOW_ORDER',
  ON_EXECUTED_ORDER = 'ON_EXECUTED_ORDER',
  ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
}

// Define types for event payloads
export interface CowEventPayloads {
  [CowEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload
  [CowEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [CowEvents.ON_POSTED_ETH_FLOW_ORDER]: OnPostedEthFlowOrderPayload
  [CowEvents.ON_EXECUTED_ORDER]: OnExecutedOrderPayload
  [CowEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload
}
