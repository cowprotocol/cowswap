import type { CSSProperties } from 'react'

/**
 * Maps a plain object to React inline styles whose keys are CSS custom properties.
 *
 * Numeric values are serialized as `px`. Entries with `undefined` values are omitted.
 *
 * @param obj - Property map; keys become `--${key}` custom properties
 * @returns A `style`-compatible object of CSS custom properties
 *
 * @example
 * ```tsx
 * <Button style={asCSSVars({ size: 18, color: 'red', 'color-hover': 'blue' })} />
 * // → { '--size': '18px', '--color': 'red', '--color-hover': 'blue' }
 * ```
 */
export function asCSSVars(obj: Record<string, string | number | undefined>): CSSProperties {
  const style: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      style[`--${key}`] = typeof value === 'number' ? `${value}px` : value
    }
  }

  return style as CSSProperties
}
