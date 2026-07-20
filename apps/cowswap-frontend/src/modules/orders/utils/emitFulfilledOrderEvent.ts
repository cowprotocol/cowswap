import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents } from '@cowprotocol/events'
import { BridgeOrderDataSerialized, UiOrderType } from '@cowprotocol/types'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { getOrderTypeForLifecycleEvent } from './getOrderTypeForLifecycleEvent'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

export function emitFulfilledOrderEvent(
  chainId: SupportedChainId,
  order: EnrichedOrder,
  bridgeOrder?: BridgeOrderDataSerialized,
  orderType?: UiOrderType,
): void {
  const payload = {
    chainId,
    order,
    bridgeOrder,
    orderType: orderType ?? getOrderTypeForLifecycleEvent(order),
  }

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_FULFILLED_ORDER, payload)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_FULFILLED_ORDER, payload)
}
