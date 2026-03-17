import { configure } from 'safe-stable-stringify'

/** Stringify that handles circular refs; bigints are converted in prePass. */
const stringify = configure({ bigint: false })

/**
 * Recursively replace bigint with string so output is JSON-serializable.
 * Uses WeakSet to avoid stack overflow on circular references.
 */
function replaceBigints(val: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof val === 'bigint') return val.toString()
  if (val === null || typeof val !== 'object') return val
  if (seen.has(val)) return val
  seen.add(val)
  if (Array.isArray(val)) return val.map((v) => replaceBigints(v, seen))
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(val)) {
    out[k] = replaceBigints(v, seen)
  }
  return out
}

/**
 * JSON.stringify that safely handles bigint (serialized as string) and circular references.
 * Returns empty string on any serialization error.
 */
export function stringifyJsonSafe(value: unknown): string {
  try {
    const result = stringify(replaceBigints(value))
    return result ?? ''
  } catch {
    return ''
  }
}
