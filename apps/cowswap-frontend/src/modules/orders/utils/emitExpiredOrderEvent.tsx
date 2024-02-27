import { CowEvents, OnExpiredOrderPayload } from '@cowprotocol/events'

import { EVENT_EMITTER } from 'eventEmitter'

export function emitExpiredOrderEvent(payload: OnExpiredOrderPayload) {
  EVENT_EMITTER.emit(CowEvents.ON_EXPIRED_ORDER, payload)
}
