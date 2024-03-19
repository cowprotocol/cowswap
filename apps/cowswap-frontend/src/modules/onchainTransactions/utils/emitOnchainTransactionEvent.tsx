import { CowEvents, OnTransactionPayload } from '@cowprotocol/events'

import { EVENT_EMITTER } from 'eventEmitter'

export function emitOnchainTransactionEvent(payload: OnTransactionPayload) {
  EVENT_EMITTER.emit(CowEvents.ON_ONCHAIN_TRANSACTION, payload)
}
