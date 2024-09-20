import { CowWidgetEvents, OnExpiredOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function emitExpiredOrderEvent(payload: OnExpiredOrderPayload) {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_EXPIRED_ORDER, payload)
}
