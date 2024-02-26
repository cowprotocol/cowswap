import { CowEvents, OnCancelledOrderPayload } from '@cowprotocol/events'

import { EVENT_EMITTER } from 'eventEmitter'

export function emitCancelledOrderEvent(payload: OnCancelledOrderPayload) {
  EVENT_EMITTER.emit(CowEvents.ON_CANCELLED_ORDER, payload)
}
