type EventKey = string

type EventMap<K extends EventKey> = Record<K, unknown>

export type CowEventHandler<M extends EventMap<E>, E extends EventKey> = (payload: M[E]) => void

export type CowEventListener<M extends EventMap<E>, E extends EventKey> = E extends EventKey
  ? { event: E; handler: CowEventHandler<M, E> }
  : never

export interface CowEventEmitter<M extends EventMap<E>, E extends EventKey> {
  on(listener: CowEventListener<M, E>): CowEventListener<M, E>
  off(listener: CowEventListener<M, E>): CowEventListener<M, E>
  emit<T extends E>(event: T, payload: M[T]): void
}

export class SimpleCowEventEmitter<M extends EventMap<E>, E extends EventKey> implements CowEventEmitter<M, E> {
  private subscriptions: {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: CowEventHandler<any, any>[] // Use generic parameter for listener type
  } = {}

  on(listener: CowEventListener<M, E>): CowEventListener<M, E> {
    const { event, handler } = listener
    if (!this.subscriptions[event]) {
      this.subscriptions[event] = []
    }
    this.subscriptions[event].push(handler)

    return listener
  }

  off(listener: CowEventListener<M, E>): CowEventListener<M, E> {
    const { event, handler } = listener
    if (this.subscriptions[event]) {
      this.subscriptions[event] = this.subscriptions[event].filter((listener) => listener !== handler)
    }

    return listener
  }

  emit<T extends E>(event: T, payload: M[T]): void {
    if (this.subscriptions[event]) {
      this.subscriptions[event].forEach((handler) => handler(payload))
    }
  }
}
