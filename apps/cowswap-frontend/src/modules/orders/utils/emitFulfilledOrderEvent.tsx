import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function emitFulfilledOrderEvent(chainId: SupportedChainId, order: EnrichedOrder) {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_FULFILLED_ORDER, {
    chainId,
    order,
  })
}
