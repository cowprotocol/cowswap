import { CowWidgetEvents, OnTransactionPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function emitOnchainTransactionEvent(payload: OnTransactionPayload) {
  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_ONCHAIN_TRANSACTION, payload)
}
