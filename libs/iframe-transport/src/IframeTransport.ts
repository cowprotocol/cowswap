import { WindowListener } from './types'
import { HttpsUrlString, UrlString } from './url.utils'

// @ts-ignore
type AbstractRecord = Record<unknown, unknown>

const DEFAULT_ORIGIN = 'https://swap.cow.fi' as const satisfies HttpsUrlString

interface EventData {
  key: string
  method: string
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
    targetWindow: Window,
    method: T,
    callback: (payload: MethodsEmitPayloadMap[T]) => void,
    trustedOrigin: UrlString,
  ): (payload: MessageEvent<unknown>) => void {
    const listener = (event: MessageEvent<unknown>): void => {
      if (!isEventData(event.data) || event.data.key !== this.key || event.data.method !== method) {
        return
      }

      if (!event.source || event.source !== targetWindow) {
        const isLocalEnv = isLocalEnvOrigin(event.origin) || isLocalEnvOrigin(trustedOrigin)

        if (!isLocalEnv) {
          logWidget('Rejected message due to source mismatch', {
            key: this.key,
            method,
            actualSource: event.source,
            expectedSource: targetWindow,
          })
          return
        }

        // Some local dev setups can deliver MessageEvents with a null `source` or a WindowProxy that doesn't compare
        // strictly equal, even though origin + payload match. Allow it locally to avoid breaking iframe transports.
        logWidget('Non-matching or missing message source. Continuing due to local env.', {
          key: this.key,
          method,
          actualSource: event.source,
          expectedSource: targetWindow,
        })
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
    contentWindow.removeEventListener('message', callback as WindowListener)
  }

  stopListeningWindowListener(contentWindow: Window, callback: WindowListener): void {
    contentWindow.removeEventListener('message', callback)
  }
}

export function isLocalEnvOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)

    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]'
  } catch {
    return false
  }
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

function logWidget(...args: unknown[]): void {
  if (process.env['NODE_ENV'] === 'test') return

  console.debug('%c [COW][Widget]', 'font-weight: bold; color: #ff0000', ...args)
}
