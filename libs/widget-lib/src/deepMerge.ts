function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Recursively merges two plain objects into a new object without mutating the inputs.
 *
 * For each key, the value from `overrides` wins when it is not `undefined`.
 * When both values are plain objects, they are merged recursively with the same rule.
 * Arrays, `Date`, and other non-plain objects are treated as leaves (no recursive merge).
 *
 * @param overrides - Values that take precedence (e.g. user-provided options). Must not be nullish.
 * @param base - Fallback values (e.g. defaults). Keys missing from `overrides` or set to `undefined` there are taken from `base`.
 * @returns A new object containing the merged result.
 *
 * @remarks
 * Prototype pollution is avoided by building the result from a null-prototype object.
 *
 * @example
 * ```ts
 * const defaults = { a: 1, nested: { x: 0, y: 1 } }
 * const user = { nested: { x: 2 } }
 * deepMerge(user, defaults) // { a: 1, nested: { x: 2, y: 1 } }
 * ```
 */
export function deepMerge<T extends object, U extends object>(overrides: T, base: U): T & U {
  const keys = new Set([
    ...Object.keys(base as Record<string, unknown>),
    ...Object.keys(overrides as Record<string, unknown>),
  ])

  const merged = Object.create(null) as Record<string, unknown>

  for (const key of keys) {
    const vOverride = (overrides as Record<string, unknown>)[key]
    const vBase = (base as Record<string, unknown>)[key]

    if (isPlainObject(vOverride) && isPlainObject(vBase)) {
      merged[key] = deepMerge(vOverride, vBase)
    } else if (isPlainObject(vOverride) && vBase === undefined) {
      merged[key] = deepMerge(vOverride, {})
    } else if (vOverride !== undefined) {
      merged[key] = vOverride
    } else {
      merged[key] = vBase
    }
  }

  return merged as T & U
}
