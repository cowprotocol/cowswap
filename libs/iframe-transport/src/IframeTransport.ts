import { WindowListener } from './types'

// @ts-ignore
type AbstractRecord = Record<unknown, unknown>

const DEFAULT_ORIGIN = 'https://swap.cow.fi'

function logWidget(...args: unknown[]): void {
  console.debug('%c [COW][Widget]', 'font-weight: bold; color: #ff0000', ...args)
}

export class IframeTransport<MethodsEmitPayloadMap extends AbstractRecord> {
  constructor(public readonly key: string) {}

  postMessageToWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    method: T,
    payload: MethodsEmitPayloadMap[T],
    targetOrigin = DEFAULT_ORIGIN,
  ): void {
    const data = typeof payload === 'object' ? payload : {}
    const postPayload = {
      key: this.key,
      method,
      ...data,
    }
    contentWindow.postMessage(postPayload, targetOrigin)
  }

  listenToMessageFromWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    targetWindow: Window,
    method: T,
    callback: (payload: MethodsEmitPayloadMap[T]) => void,
    trustedOrigin = DEFAULT_ORIGIN,
  ): (payload: MessageEvent<unknown>) => void {
    const listener = (event: MessageEvent<unknown>): void => {
      if (!isEventData(event.data) || event.data.key !== this.key || event.data.method !== method) {
        return
      }

      if (!event.source || event.source !== targetWindow) {
        logWidget('Rejected message due to source mismatch', {
          key: this.key,
          method,
          actualSource: event.source,
          expectedSource: targetWindow,
        })
        return
      }

      if (event.origin !== trustedOrigin) {
        logWidget('Rejected message due to origin mismatch', {
          key: this.key,
          method,
          actualOrigin: event.origin,
          trustedOrigin,
        })
        return
      }

      callback(event.data as MethodsEmitPayloadMap[T])
    }
    contentWindow.addEventListener('message', listener)

    return listener
  }

  stopListeningToMessageFromWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    _method: T,
    callback: (payload: MethodsEmitPayloadMap[T]) => void,
  ): void {
    contentWindow.removeEventListener('message', callback as never)
  }

  stopListeningWindowListener(contentWindow: Window, callback: WindowListener): void {
    contentWindow.removeEventListener('message', callback)
  }
}

interface EventData {
  key: string
  method: string
}

function isEventData(obj: unknown): obj is EventData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'key' in obj &&
    'method' in obj &&
    typeof obj.key === 'string' &&
    typeof obj.method === 'string'
  )
}
