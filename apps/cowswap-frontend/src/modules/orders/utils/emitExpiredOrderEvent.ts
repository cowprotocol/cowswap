import { CowWidgetEvents, OnExpiredOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function emitExpiredOrderEvent(payload: OnExpiredOrderPayload) {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_EXPIRED_ORDER, payload)
}
