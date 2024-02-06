import { OnExecutedOrderPayload, OnPostedOrderPayload, OnRejectedOrderPayload } from './orders'
import { OnToastMessagePayload } from './toastMessages'

export type EventNames = 'updateWidgetConfig' | 'onToastMessage' | 'onPostedOrder' | 'onExecutedOrder'

// Define types for event payloads
export interface EventPayloads {
  updateWidgetConfig: { theme: string } // TODO: move here the widget params?
  onToastMessage: OnToastMessagePayload
  onPostedOrder: OnPostedOrderPayload
  onExecutedOrder: OnExecutedOrderPayload
  onRejectedOrder: OnRejectedOrderPayload
}
