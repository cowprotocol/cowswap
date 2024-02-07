import { CowEvents, CowEventPayloads } from './types'

export type CowEventHandler<T extends keyof CowEventPayloads> = (payload: CowEventPayloads[T]) => void

export type CowEventListener<T extends CowEvents> = T extends keyof CowEventPayloads
  ? { event: T; handler: CowEventHandler<T> }
  : never

export type CowEventListeners = CowEventListener<CowEvents>[]

export interface CowEventEmitter {
  on<T extends CowEvents>(listener: CowEventListener<T>): void
  off<T extends CowEvents>(listener: CowEventListener<T>): void
  emit<T extends CowEvents>(event: T, payload: CowEventPayloads[T]): void
}

export class CowEventEmitterImpl implements CowEventEmitter {
  private events: {
    [key: string]: CowEventHandler<any>[] // Use generic parameter for listener type
  }

  constructor() {
    this.events = {}
  }

  on<T extends CowEvents>(listener: CowEventListener<T>): void {
    const { event, handler } = listener
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off<T extends CowEvents>(listener: CowEventListener<T>): void {
    const { event, handler } = listener
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((listener) => listener !== handler)
    }
  }

  emit<T extends keyof CowEventPayloads>(event: T, payload: CowEventPayloads[T]): void {
    if (this.events[event]) {
      this.events[event].forEach((handler) => {
        handler(payload)
      })
    }
  }
}
