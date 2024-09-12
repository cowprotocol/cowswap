import { CowWidgetEventPayloadMap, CowWidgetEvents, SimpleCowEventEmitter } from '@cowprotocol/events'

export const WIDGET_EVENT_EMITTER = Object.freeze(
  new SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>(),
)
