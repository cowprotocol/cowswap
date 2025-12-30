import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents } from '@cowprotocol/events'
import { BridgeOrderDataSerialized } from '@cowprotocol/types'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitFulfilledOrderEvent(
  chainId: SupportedChainId,
  order: EnrichedOrder,
  bridgeOrder?: BridgeOrderDataSerialized,
): void {
  const payload = {
    chainId,
    order,
    bridgeOrder,
  }

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_FULFILLED_ORDER, payload)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_FULFILLED_ORDER, payload)
}
