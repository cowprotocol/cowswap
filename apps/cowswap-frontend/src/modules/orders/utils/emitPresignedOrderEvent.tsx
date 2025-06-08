import { CowWidgetEvents, OnPresignedOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function emitPresignedOrderEvent(payload: OnPresignedOrderPayload) {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_PRESIGNED_ORDER, payload)
}
