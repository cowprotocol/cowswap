import { CowWidgetEvents, OnCancelledOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitCancelledOrderEvent(payload: OnCancelledOrderPayload): void {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_CANCELLED_ORDER, payload)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_CANCELLED_ORDER, payload)
}
