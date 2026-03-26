import {
  WidgetHookEvents,
  WidgetHookPayloadMap,
  widgetIframeTransport,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import { v4 as uuidv4 } from 'uuid'

const callsRegistry = new Map<string, (result: boolean) => void>()

widgetIframeTransport.listenToMessageFromWindow(window, WidgetMethodsListen.HOOK_RESULT, (data) => {
  const callback = callsRegistry.get(data.id)

  if (callback) {
    callback(data.result)
  }
})

export function callWidgetHook(event: WidgetHookEvents, payload: WidgetHookPayloadMap[typeof event]): Promise<boolean> {
  const id = uuidv4()

  widgetIframeTransport.postMessageToWindow(window.parent, WidgetMethodsEmit.PROCESS_HOOK, {
    id,
    event,
    payload,
  })

  return new Promise((resolve) => {
    callsRegistry.set(id, resolve)
  })
}
