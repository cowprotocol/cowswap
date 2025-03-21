import { setupEventHandlers } from '@cowprotocol/analytics'
import { SimpleCowEventEmitter, CowWidgetEventPayloadMap, CowWidgetEvents } from '@cowprotocol/events'

export const WIDGET_EVENT_EMITTER = new SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>()

setupEventHandlers(WIDGET_EVENT_EMITTER)
