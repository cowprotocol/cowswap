const MAX_DEPTH = 4
const MAX_MESSAGE_LENGTH = 200
const NESTED_KEYS = ['body', 'context', 'errorBody', 'error']

/**
 * Bridge providers explain why a quote failed in the API response body, but that body reaches us
 * wrapped differently depending on the provider and on how many layers re-threw the error: the
 * provider SDK's own error (`{ body: { message } }`), the parsed body forwarded as-is (`{ message }`),
 * or either of those nested under `context` / `errorBody`.
 *
 * Walk those shapes so a real reason - e.g. Near Intents' "Temporary swap limits: minimum swap amount
 * is $1,000" - reaches the user instead of a generic "try again later" they can't act on.
 *
 * `Error.message` is deliberately skipped: the provider SDKs set it to the bare HTTP status text
 * ("Bad Request"), which says nothing, while the useful message sits in `body`.
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
