import { CowWidgetEvents, OnCancelledOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function emitCancelledOrderEvent(payload: OnCancelledOrderPayload) {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_CANCELLED_ORDER, payload)
}
