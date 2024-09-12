import {
  SimpleCowEventEmitter,
  CowWidgetEventListeners,
  CowWidgetEvents,
  CowWidgetEventPayloadMap,
} from '@cowprotocol/events'

import { WindowListener, listenToMessageFromWindow, stopListeningWindowListener } from './messages'
import { WidgetMethodsEmit } from './types'

export class IframeCowEventEmitter {
  private eventEmitter = new SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>()
  private listeners: CowWidgetEventListeners = []
  private widgetListener: WindowListener

  constructor(
    private contentWindow: Window,
    listeners: CowWidgetEventListeners = [],
  ) {
    // Subscribe listeners to local event emitter
    this.updateListeners(listeners)

    // Listen to iFrame, and forward to local event emitter
    this.widgetListener = listenToMessageFromWindow(this.contentWindow, WidgetMethodsEmit.EMIT_COW_EVENT, (cowEvent) =>
      this.eventEmitter.emit(cowEvent.event, cowEvent.payload),
    )
  }

  public stopListeningIframe() {
    stopListeningWindowListener(this.contentWindow, this.widgetListener)
  }

  public updateListeners(listeners?: CowWidgetEventListeners): void {
    // Unsubscribe from previous listeners
    for (const listener of this.listeners) {
      this.eventEmitter.off(listener)
    }

    // Subscribe to events
    this.listeners = listeners || []
    for (const listener of this.listeners) {
      this.eventEmitter.on(listener)
    }
  }
}
