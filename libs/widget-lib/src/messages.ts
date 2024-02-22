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
  // console.log('[widget:messages] postMessageToWindow', postPayload)
  contentWindow.postMessage(
    postPayload,
    '*' // TODO: Change to CoW specific origin in production. https://github.com/cowprotocol/cowswap/issues/3828
  )
}

export function listenToMessageFromWindow<T extends WidgetMethodsListen>(
  contentWindow: Window,
  method: T,
  callback: (payload: WidgetMethodsListenPayloadMap[T]) => void
): void
export function listenToMessageFromWindow<T extends WidgetMethodsEmit>(
  contentWindow: Window,
  method: T,
  callback: (payload: WidgetMethodsEmitPayloadMap[T]) => void
): void

export function listenToMessageFromWindow(contentWindow: Window, method: string, callback: (payload: unknown) => void) {
  contentWindow.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== method) {
      return
    }

    callback(event.data)
  })
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
