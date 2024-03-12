import { OnAddedHookPayload, OnRemovedPayload } from './hooks'
import {
  OnExecutedOrderPayload,
  OnPostedOrderPayload,
  OnRejectedOrderPayload as OnCancelledOrderPayload,
  OnPostedEthFlowOrderPayload,
} from './orders'
import { OnToastMessagePayload } from './toastMessages'

export enum CowEvents {
  // Toasts
  ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',

  // Orders
  ON_POSTED_ORDER = 'ON_POSTED_ORDER',
  ON_POSTED_ETH_FLOW_ORDER = 'ON_POSTED_ETH_FLOW_ORDER',
  ON_EXECUTED_ORDER = 'ON_EXECUTED_ORDER',
  ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',

  // Hooks
  ON_ADDED_HOOK = 'ON_ADDED_HOOK',
  ON_REMOVED_HOOK = 'ON_REMOVED_HOOK',
}

// Define types for event payloads
export interface CowEventPayloadMap {
  [CowEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload
  [CowEvents.ON_POSTED_ORDER]: OnPostedOrderPayload
  [CowEvents.ON_POSTED_ETH_FLOW_ORDER]: OnPostedEthFlowOrderPayload
  [CowEvents.ON_EXECUTED_ORDER]: OnExecutedOrderPayload
  [CowEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload
  [CowEvents.ON_ADDED_HOOK]: OnAddedHookPayload
  [CowEvents.ON_REMOVED_HOOK]: OnRemovedPayload
}

export type CowEventPayloads = CowEventPayloadMap[CowEvents]
