import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents } from '@cowprotocol/events'
import { BridgeOrderDataSerialized } from '@cowprotocol/types'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function emitFulfilledOrderEvent(
  chainId: SupportedChainId,
  order: EnrichedOrder,
  bridgeOrder?: BridgeOrderDataSerialized,
): void {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_FULFILLED_ORDER, {
    chainId,
    order,
    bridgeOrder,
  })
}
