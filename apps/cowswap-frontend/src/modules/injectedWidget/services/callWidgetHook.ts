import { isInjectedWidget } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import {
  WidgetHookEvents,
  WidgetHookPayloadMap,
  widgetIframeTransport,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import ms from 'ms.macro'

import { injectedWidgetHooksEnabledAtom } from '../state/injectedWidgetHooksEnabledAtom'

const callsRegistry = new Map<string, (result: boolean) => void>()
const HOOK_RESPONSE_TIMEOUT_MS = ms`2m`
let isListenerRegistered = false

export function callWidgetHook<T extends WidgetHookEvents>(
  event: T,
  payload: WidgetHookPayloadMap[T],
): Promise<boolean> {
  if (!isInjectedWidget()) {
    console.log(`[COW][HOOKS] Skipping hooks, reason: not an injected widget`)
    return Promise.resolve(true)
  }
  if (!areWidgetHooksEnabled()) {
    console.log(`[COW][HOOKS] Skipping hooks, reason: hooks are not enabled`)
    return Promise.resolve(true)
  }

  const id = window.crypto.randomUUID()
  console.log(`[COW][HOOKS] Calling widget hook, event: ${event}, generated id: ${id}`)

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      callsRegistry.delete(id)
      resolve(false)
    }, HOOK_RESPONSE_TIMEOUT_MS)

    callsRegistry.set(id, (result) => {
      window.clearTimeout(timeoutId)
      resolve(result)
    })

    const parentOrigin = getParentOrigin()

    if (!parentOrigin) {
      callsRegistry.delete(id)
      window.clearTimeout(timeoutId)
      resolve(false)
      return
    }

    ensureListenerRegistered(parentOrigin)

    widgetIframeTransport.postMessageToWindow(
      window.parent,
      WidgetMethodsEmit.PROCESS_HOOK,
      {
        id,
        event,
        payload,
      },
      parentOrigin,
    )
  })
}

function areWidgetHooksEnabled(): boolean {
  return jotaiStore.get(injectedWidgetHooksEnabledAtom)
}

function ensureListenerRegistered(parentOrigin: string): void {
  if (isListenerRegistered) {
    return
  }

  widgetIframeTransport.listenToMessageFromWindow(
    window,
    window.parent,
    WidgetMethodsListen.HOOK_RESULT,
    (data) => {
      const callback = callsRegistry.get(data.id)

      if (callback) {
        callback(data.result)
        callsRegistry.delete(data.id)
      }
    },
    parentOrigin,
  )

  isListenerRegistered = true
}
