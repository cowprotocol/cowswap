import { isInjectedWidget } from '@cowprotocol/common-utils'
import {
  WidgetHookEvents,
  WidgetHookPayloadMap,
  widgetIframeTransport,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import ms from 'ms.macro'

const callsRegistry = new Map<string, (result: boolean) => void>()
const HOOK_RESPONSE_TIMEOUT_MS = ms`5m`

widgetIframeTransport.listenToMessageFromWindow(window, WidgetMethodsListen.HOOK_RESULT, (data) => {
  const callback = callsRegistry.get(data.id)

  if (callback) {
    callback(data.result)
    callsRegistry.delete(data.id)
  }
})

export function callWidgetHook<T extends WidgetHookEvents>(
  event: T,
  payload: WidgetHookPayloadMap[T],
): Promise<boolean> {
  if (!isInjectedWidget()) return Promise.resolve(true)

  const id = window.crypto.randomUUID()

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      callsRegistry.delete(id)
      resolve(false)
    }, HOOK_RESPONSE_TIMEOUT_MS)

    callsRegistry.set(id, (result) => {
      window.clearTimeout(timeoutId)
      resolve(result)
    })

    widgetIframeTransport.postMessageToWindow(window.parent, WidgetMethodsEmit.PROCESS_HOOK, {
      id,
      event,
      payload,
    })
  })
}
