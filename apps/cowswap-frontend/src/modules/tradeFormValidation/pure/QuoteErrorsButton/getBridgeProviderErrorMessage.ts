const MAX_DEPTH = 4
const MAX_MESSAGE_LENGTH = 100
const NESTED_KEYS = ['body', 'context', 'errorBody', 'error']

export function getBridgeProviderErrorMessage(context: unknown, depth = 0): string | null {
  if (depth > MAX_DEPTH || typeof context !== 'object' || context === null) return null

  const ownMessage = getOwnMessage(context)

  if (ownMessage) return truncate(ownMessage)

  for (const key of NESTED_KEYS) {
    const nested = getBridgeProviderErrorMessage((context as Record<string, unknown>)[key], depth + 1)

    if (nested) return nested
  }

  return null
}

function getOwnMessage(context: object): string | null {
  const { originalMessage, message } = context as { originalMessage?: unknown; message?: unknown }

  if (typeof originalMessage === 'string' && originalMessage.trim()) {
    return originalMessage.trim()
  }

  if (!(context instanceof Error) && typeof message === 'string' && message.trim()) {
    return message.trim()
  }

  return null
}

function truncate(message: string): string {
  return message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH).trimEnd()}…` : message
}
