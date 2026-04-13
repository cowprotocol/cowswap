import { WindowListener } from './types'
import { HttpsUrlString, UrlString } from './url.utils'

// @ts-ignore
type AbstractRecord = Record<unknown, unknown>

const DEFAULT_ORIGIN = 'https://swap.cow.fi' as const satisfies HttpsUrlString

function logWidget(...args: unknown[]): void {
  console.debug('%c [COW][Widget]', 'font-weight: bold; color: #ff0000', ...args)
}

export class IframeTransport<MethodsEmitPayloadMap extends AbstractRecord> {
  constructor(public readonly key: string) {}

  postMessageToWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    method: T,
    payload: MethodsEmitPayloadMap[T],
    targetOrigin: UrlString,
  ): void {
    const data = typeof payload === 'object' ? payload : {}
    const postPayload = {
      key: this.key,
      method,
      ...data,
    }

    // Old versions of the widget will still have '*' as target origin, so we fallback to the default origin. Integrations using a custom `baseUrl` will break.
    contentWindow.postMessage(postPayload, targetOrigin || DEFAULT_ORIGIN)
  }

  listenToMessageFromWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    method: T,
    callback: (payload: MethodsEmitPayloadMap[T]) => void,
    trustedOrigin: UrlString,
  ): (payload: MessageEvent<unknown>) => void {
    const listener = (event: MessageEvent<unknown>): void => {
      if (!isEventData(event.data) || event.data.key !== this.key || event.data.method !== method) {
        return
      }

      // TODO: fix source check in a follow up PR
      // if (event.source !== contentWindow) {
      //   logWidget('Rejected message due to source mismatch', {
      //     key: this.key,
      //     method,
      //     actualSource: event.source,
      //     expectedSource: contentWindow,
      //   })
      //   return
      // }

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
    contentWindow.removeEventListener('message', callback as WindowListener)
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
