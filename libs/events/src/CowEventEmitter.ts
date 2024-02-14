import { CowEvents, CowEventPayloadMap } from './types'

export type CowEventHandler<T extends CowEvents> = (payload: CowEventPayloadMap[T]) => void

export type CowEventListener<T extends CowEvents> = T extends CowEvents
  ? { event: T; handler: CowEventHandler<T> }
  : never

export type CowEventListeners = CowEventListener<CowEvents>[]

export interface CowEventEmitter {
  on(listener: CowEventListener<CowEvents>): void
  off(listener: CowEventListener<CowEvents>): void
  emit<T extends CowEvents>(event: T, payload: CowEventPayloadMap[T]): void
}

export class SimpleCowEventEmitter implements CowEventEmitter {
  private subscriptions: {
    [key: string]: CowEventHandler<any>[] // Use generic parameter for listener type
  } = {}

  on(listener: CowEventListener<CowEvents>): void {
    const { event, handler } = listener
    if (!this.subscriptions[event]) {
      this.subscriptions[event] = []
    }
    this.subscriptions[event].push(handler)
  }

  off(listener: CowEventListener<CowEvents>): void {
    const { event, handler } = listener
    if (this.subscriptions[event]) {
      this.subscriptions[event] = this.subscriptions[event].filter((listener) => listener !== handler)
    }
  }

  emit<T extends CowEvents>(event: T, payload: CowEventPayloadMap[T]): void {
    if (this.subscriptions[event]) {
      this.subscriptions[event].forEach((handler) => handler(payload))
    }
  }
}
