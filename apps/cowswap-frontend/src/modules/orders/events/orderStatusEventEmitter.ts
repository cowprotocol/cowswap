import { SimpleCowEventEmitter } from '@cowprotocol/events'

import { OrderStatusEventPayloadMap, OrderStatusEvents } from './events'

export const ORDER_STATUS_EVENT_EMITTER = new SimpleCowEventEmitter<OrderStatusEventPayloadMap, OrderStatusEvents>()
