const MAX_DEPTH = 4
const MAX_MESSAGE_LENGTH = 200
const NESTED_KEYS = ['body', 'context', 'errorBody', 'error']

/**
 * Finds the provider's own explanation inside a `BridgeProviderQuoteError.context`. Each provider
 * and each re-throwing layer wraps the API response body differently: `{ body: { message } }`,
 * a bare `{ message }`, or either nested under `context` / `errorBody`.
 *
 * `Error.message` is skipped on purpose - the provider SDKs set it to the HTTP status text
 * ("Bad Request") while the useful message sits in `body`.
 */
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
