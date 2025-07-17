import { CowWidgetEvents, OnBridgingSuccessPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function emitBridgingSuccessEvent(payload: OnBridgingSuccessPayload): void {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_BRIDGING_SUCCESS, payload)
}
