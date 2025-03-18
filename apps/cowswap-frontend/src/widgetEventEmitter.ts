import { setupEventHandlers, getCowAnalytics } from '@cowprotocol/analytics'
import { CowWidgetEventPayloadMap, CowWidgetEvents, SimpleCowEventEmitter } from '@cowprotocol/events'

export const WIDGET_EVENT_EMITTER = new SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>()

setupEventHandlers(WIDGET_EVENT_EMITTER, getCowAnalytics)
