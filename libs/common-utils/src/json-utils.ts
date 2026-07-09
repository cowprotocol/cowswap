export type JsonRecord = Record<string, unknown>

export function isRecord(value: unknown): value is JsonRecord {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * Best-effort JSON.parse: returns the parsed value on success, `undefined` on
 * any parse error. Use when malformed input is recoverable (e.g. optional
 * payload, fallback path) and the caller does not want to handle a throw.
 */
export function tryParseJson<T>(text: string): T | undefined {
  try {
    return JSON.parse(text) as T
  } catch {
    return undefined
  }
}

export function readNumberField<T extends object>(value: T | undefined | null, key: keyof T): number | undefined {
  if (!value) return undefined

  const raw = value[key]

  return typeof raw === 'number' ? raw : undefined
}

export function readStringField<T extends object>(value: T | undefined | null, key: keyof T): string | undefined {
  if (!value) return undefined

  const raw = value[key]

  return typeof raw === 'string' ? raw : undefined
}
