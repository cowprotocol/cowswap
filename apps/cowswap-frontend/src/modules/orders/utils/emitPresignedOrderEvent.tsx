import { CowEvents, OnPresignedOrderPayload } from '@cowprotocol/events'

import { EVENT_EMITTER } from 'eventEmitter'

export function emitPresignedOrderEvent(payload: OnPresignedOrderPayload) {
  EVENT_EMITTER.emit(CowEvents.ON_PRESIGNED_ORDER, payload)
}
