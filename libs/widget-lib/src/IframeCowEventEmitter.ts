import { SimpleCowEventEmitter, CowEventListener, CowEventListeners, CowEvents } from '@cowprotocol/events'
const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

export class IframeCowEventEmitter {
  private eventEmitter: SimpleCowEventEmitter = new SimpleCowEventEmitter()

  constructor(private listeners: CowEventListeners = []) {
    // Subscribe to events
    this.updateListeners(listeners)

    // Forward messages to the event emitter
    window.addEventListener('message', this.forwardEvents)
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

  private forwardEvents = (event: MessageEvent): void => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'event') {
      return
    }
    this.eventEmitter.emit(event.data.eventName, event.data.payload)
  }
}
