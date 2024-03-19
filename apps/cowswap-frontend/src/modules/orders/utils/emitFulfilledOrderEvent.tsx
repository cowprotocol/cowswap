import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowEvents } from '@cowprotocol/events'

import { EVENT_EMITTER } from 'eventEmitter'

export function emitFulfilledOrderEvent(order: EnrichedOrder, chainId: SupportedChainId) {
  EVENT_EMITTER.emit(CowEvents.ON_FULFILLED_ORDER, {
    chainId,
    order,
  })
}
