const MAX_DEPTH = 4
const MAX_MESSAGE_LENGTH = 200
const NESTED_KEYS = ['body', 'context', 'errorBody', 'error']

export function getBridgeProviderErrorMessage(context: unknown, depth = 0): string | null {
  if (depth > MAX_DEPTH || typeof context !== 'object' || context === null) return null

  const message = (context as { message?: unknown }).message

  if (!(context instanceof Error) && typeof message === 'string' && message.trim()) {
    return truncate(message.trim())
  }

  for (const key of NESTED_KEYS) {
    const nested = getBridgeProviderErrorMessage((context as Record<string, unknown>)[key], depth + 1)

    if (nested) return nested
  }

  return null
}

function truncate(message: string): string {
  return message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH).trimEnd()}…` : message
}
