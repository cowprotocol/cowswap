export function jsonHelperText(hasError: boolean): string {
  return hasError ? 'Invalid JSON.' : 'Optional. CamelCase CSS properties as JSON, e.g. { "fooBar": "1234" }'
}

/** True when the value is non-empty but cannot be parsed as JSON. Empty values are considered valid. */
export function isInvalidJson(value: string | null): boolean {
  if (!value?.trim()) return false

  try {
    JSON.parse(value)
    return false
  } catch {
    return true
  }
}

/** Parses a JSON string field, returning the fallback when empty or invalid. */
export function parseJsonOrFallback<T>(value: string | null, fallback: T): T {
  if (!value?.trim()) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
