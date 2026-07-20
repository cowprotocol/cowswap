import { CowWidgetEvents, OnExpiredOrderPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { addOrderTypeToLifecyclePayload, LifecycleOrderPayloadInput } from './getOrderTypeForLifecycleEvent'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitExpiredOrderEvent(payload: LifecycleOrderPayloadInput<OnExpiredOrderPayload>): void {
  const payloadWithOrderType = addOrderTypeToLifecyclePayload(payload)

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_EXPIRED_ORDER, payloadWithOrderType)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_EXPIRED_ORDER, payloadWithOrderType)
}
