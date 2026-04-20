import { widgetIframeTransport } from '@cowprotocol/widget-lib'

interface CachedMessageEnvelope {
  data: unknown
  origin: string
  source: MessageEventSource | null
}

const messagesCache: Record<string, CachedMessageEnvelope> = {}

export function cacheWidgetMessage(event: MessageEvent): void {
  const method = getEventMethod(event)

  if (!method) {
    return
  }

  messagesCache[method] = {
    data: event.data,
    origin: event.origin,
    source: event.source,
  }
}

export function replayCachedWidgetMessage(method: string): void {
  const cachedMessage = messagesCache[method]

  if (!cachedMessage) {
    return
  }

  window.dispatchEvent(
    new MessageEvent('message', {
      origin: cachedMessage.origin,
      data: cachedMessage.data,
      source: cachedMessage.source,
    }),
  )
}

export function getCachedWidgetMessageMethods(): string[] {
  return Object.keys(messagesCache)
}

export function clearCachedWidgetMessage(method: string): void {
  delete messagesCache[method]
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
