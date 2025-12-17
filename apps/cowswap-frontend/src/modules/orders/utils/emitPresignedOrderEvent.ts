import { CowWidgetEvents, OnPresignedOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function emitPresignedOrderEvent(payload: OnPresignedOrderPayload): void {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_PRESIGNED_ORDER, payload)
}
