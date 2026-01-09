import { CowWidgetEvents, OnBridgingSuccessPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitBridgingSuccessEvent(payload: OnBridgingSuccessPayload): void {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_BRIDGING_SUCCESS, payload)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_BRIDGING_SUCCESS, payload)
}
