import { CowWidgetEvents, OnCancelledOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { addOrderTypeToLifecyclePayload, LifecycleOrderPayloadInput } from './getOrderTypeForLifecycleEvent'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitCancelledOrderEvent(payload: LifecycleOrderPayloadInput<OnCancelledOrderPayload>): void {
  const payloadWithOrderType = addOrderTypeToLifecyclePayload(payload)

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_CANCELLED_ORDER, payloadWithOrderType)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_CANCELLED_ORDER, payloadWithOrderType)
}
