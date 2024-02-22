import {
  WidgetMethodsEmit,
  WidgetMethodsEmitPayloadMap,
  WidgetMethodsListen,
  WidgetMethodsListenPayloadMap,
} from './types'

/**
 * Key for identifying the event associated with the CoW Swap Widget.
 */
const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

export function postMessageToWindow<T extends WidgetMethodsEmit>(
  contentWindow: Window,
  method: T,
  payload: WidgetMethodsEmitPayloadMap[T]
): void
export function postMessageToWindow<T extends WidgetMethodsListen>(
  contentWindow: Window,
  method: T,
  payload: WidgetMethodsListenPayloadMap[T]
): void

export function postMessageToWindow(contentWindow: Window, method: string, payload: unknown) {
  const data = typeof payload === 'object' ? payload : {}
  const postPayload = {
    key: COW_SWAP_WIDGET_EVENT_KEY,
    method,
    ...data,
  }
  contentWindow.postMessage(
    postPayload,
    '*' // TODO: Change to CoW specific origin in production. https://github.com/cowprotocol/cowswap/issues/3828
  )
}

export type WindowListener = (event: MessageEvent<unknown>) => void

export function listenToMessageFromWindow<T extends WidgetMethodsListen>(
  contentWindow: Window,
  method: T,
  callback: (payload: WidgetMethodsListenPayloadMap[T]) => void
): WindowListener
export function listenToMessageFromWindow<T extends WidgetMethodsEmit>(
  contentWindow: Window,
  method: T,
  callback: (payload: WidgetMethodsEmitPayloadMap[T]) => void
): WindowListener

export function listenToMessageFromWindow<T = unknown>(
  contentWindow: Window,
  method: string,
  callback: (payload: T) => void
): (payload: MessageEvent<unknown>) => void {
  const listener = (event: MessageEvent<unknown>) => {
    if (!isEventData(event.data) || event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== method) {
      return
    }

    callback(event.data as T)
  }
  contentWindow.addEventListener('message', listener)

  return listener
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

export function stopListeningToMessageFromWindow<T extends WidgetMethodsListen>(
  contentWindow: Window,
  method: T,
  callback: (payload: WidgetMethodsListenPayloadMap[T]) => void
): void
export function stopListeningToMessageFromWindow<T extends WidgetMethodsEmit>(
  contentWindow: Window,
  method: T,
  callback: (payload: WidgetMethodsEmitPayloadMap[T]) => void
): void

export function stopListeningToMessageFromWindow(
  contentWindow: Window,
  _method: string,
  callback: (payload: unknown) => void
) {
  contentWindow.removeEventListener('message', callback)
}

export function stopListeningWindowListener(contentWindow: Window, callback: WindowListener) {
  contentWindow.removeEventListener('message', callback)
}
