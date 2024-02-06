import { CowEvents, EventPayloads as CowEventPayloads } from './types'

export type CowListener<T extends CowEvents> = (payload: CowEventPayloads[T]) => void

interface CowListeners {
  [key: string]: CowListener<any>[] // Use generic parameter for listener type
}

export interface CowEventSubscription<T extends CowEvents> {
  event: T
  listener: CowListener<T>
}

export interface CowEventEmitter {
  on<T extends CowEvents>(event: T, listener: CowListener<T>): void
  emit<T extends CowEvents>(event: T, payload: CowEventPayloads[T]): void
  off<T extends CowEvents>(event: T, listenerToRemove: CowListener<T>): void
}

export class CowEventEmitterImpl {
  private events: CowListeners

  constructor() {
    this.events = {}
  }

  on<T extends CowEvents>(event: T, listener: CowListener<T>): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  emit<T extends CowEvents>(event: T, payload: CowEventPayloads[T]): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => {
        listener(payload)
      })
    }
  }

  off<T extends CowEvents>(event: T, listenerToRemove: CowListener<T>): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((listener) => listener !== listenerToRemove)
    }
  }
}
