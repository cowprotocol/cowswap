import { getParentOrigin, isLocalEnvOrigin } from '@cowprotocol/iframe-transport'
import { widgetIframeTransport, WidgetMethodsListen } from '@cowprotocol/widget-lib'

interface CachedMessageEnvelope {
  data: unknown
}

const messagesCache: Record<string, CachedMessageEnvelope> = {}
const handlers: Record<string, (data: never) => void> = {}

export function registerCachedMessageHandler(method: WidgetMethodsListen, handler: (data: never) => void): void {
  handlers[method] = handler
}

export function cacheWidgetMessage(event: MessageEvent): void {
  const method = getEventMethod(event)
  if (!method) return

  const trustedOrigin = getParentOrigin()
  if (!trustedOrigin) return

  if (event.origin !== trustedOrigin) return

  if (event.source !== window.parent) {
    const isLocalEnv = isLocalEnvOrigin(event.origin) || isLocalEnvOrigin(trustedOrigin)
    if (!isLocalEnv) return
  }

  messagesCache[method] = {
    data: event.data,
  }
}

export function replayCachedWidgetMessage(method: string): void {
  const cachedMessage = messagesCache[method]
  if (!cachedMessage) return

  const handler = handlers[method]
  if (!handler) return

  handler(cachedMessage.data as never)
}

export function getCachedWidgetMessageMethods(): string[] {
  return Object.keys(messagesCache)
}

export function clearCachedWidgetMessage(method: string): void {
  delete messagesCache[method]
  delete handlers[method]
}

export function clearCachedWidgetMessages(): void {
  Object.keys(messagesCache).forEach(clearCachedWidgetMessage)
}

function getEventMethod(event: MessageEvent): string | null {
  const data = event.data

  if (!data || typeof data !== 'object' || !('key' in data) || !('method' in data)) {
    return null
  }

  return data.key === widgetIframeTransport.key && typeof data.method === 'string' ? data.method : null
}
