import { EventNames, EventPayloads } from './types'

export type Listener<T extends EventNames> = (payload: EventPayloads[T]) => void

interface Listeners {
  [key: string]: Listener<any>[] // Use generic parameter for listener type
}

export class EventEmitter {
  private events: Listeners

  constructor() {
    this.events = {}
  }

  on<T extends EventNames>(event: T, listener: Listener<T>): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  emit<T extends EventNames>(event: T, payload: EventPayloads[T]): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => {
        listener(payload)
      })
    }
  }

  off<T extends EventNames>(event: T, listenerToRemove: Listener<T>): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((listener) => listener !== listenerToRemove)
    }
  }
}
