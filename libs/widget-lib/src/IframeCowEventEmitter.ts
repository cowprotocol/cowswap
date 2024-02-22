import { SimpleCowEventEmitter, CowEventListener, CowEventListeners, CowEvents } from '@cowprotocol/events'
import { WidgetMethodsEmit } from './types'
import { listenToMessageFromWindow } from './messages'

export class IframeCowEventEmitter {
  private eventEmitter: SimpleCowEventEmitter = new SimpleCowEventEmitter()

  constructor(contentWindow: Window, private listeners: CowEventListeners = []) {
    // Subscribe to events
    this.updateListeners(listeners)

    // Forward messages to the event emitter
    listenToMessageFromWindow(contentWindow, WidgetMethodsEmit.EMIT_COW_EVENT, (cowEvent) => {
      this.eventEmitter.emit(cowEvent.event, cowEvent.payload)
    })
  }

  public updateListeners(listeners?: CowEventListeners): void {
    // Unsubscribe from previous listeners
    for (const listener of this.listeners) {
      this.eventEmitter.off(listener as CowEventListener<CowEvents>)
    }

    // Subscribe to events
    this.listeners = listeners || []
    for (const listener of this.listeners) {
      this.eventEmitter.on(listener as CowEventListener<CowEvents>)
    }
  }
}
