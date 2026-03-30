import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitPendingOrderEvent(chainId: SupportedChainId, order: EnrichedOrder): void {
  const payload = {
    chainId,
    order,
  }

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_PENDING_ORDER, payload)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_PENDING_ORDER, payload)
}
