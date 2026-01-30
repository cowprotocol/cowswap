// Yes, this is a hack. For some reason I can't specify other types as a key
import { WindowListener } from './types'

// @ts-ignore
type AbstractRecord = Record<unknown, unknown>

export class IframeTransport<MethodsEmitPayloadMap extends AbstractRecord> {
  constructor(public readonly key: string) {}

  postMessageToWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    method: T,
    payload: MethodsEmitPayloadMap[T],
  ): void {
    const data = typeof payload === 'object' ? payload : {}
    const postPayload = {
      key: this.key,
      method,
      ...data,
    }
    contentWindow.postMessage(
      postPayload,
      '*', // TODO: Change to CoW specific origin in production. https://github.com/cowprotocol/cowswap/issues/3828
    )
  }

  listenToMessageFromWindow<T extends keyof MethodsEmitPayloadMap>(
    contentWindow: Window,
    method: T,
    callback: (payload: MethodsEmitPayloadMap[T]) => void,
  ): (payload: MessageEvent<unknown>) => void {
    const listener = (event: MessageEvent<unknown>): void => {
      if (!isEventData(event.data) || event.data.key !== this.key || event.data.method !== method) {
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
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contentWindow.removeEventListener('message', callback as any)
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
