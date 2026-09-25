import { CowSwapTheme, CowSwapWidgetPalette, WIDGET_PALETTE_COLORS } from '@cowprotocol/widget-lib'

import { parseToRgba } from 'color2k'

const BASE_THEMES: readonly CowSwapTheme[] = ['light', 'dark']

// Characters needed for box-shadow (lengths, colors, `inset`, comma-separated layers). Rejects `;`, `{}`, `:`, quotes,
// `\` escapes and `/*` comments, which could close the declaration or smuggle one in.
const BOX_SHADOW_CHARSET_REGEX = /^[a-zA-Z0-9\s#.,()%+-]+$/
// Captures the name of every CSS function call, e.g. `rgba` in `rgba(0, 0, 0, 0.1)`, so non-color functions
// such as `url()` or `expression()` can be rejected.
const CSS_FUNCTION_REGEX = /([a-zA-Z-]+)\s*\(/g
const BOX_SHADOW_ALLOWED_FUNCTIONS = ['rgb', 'rgba', 'hsl', 'hsla']

/**
 * Palette values are interpolated into styled-components CSS, so every key and value from the URL
 * must be allowlisted to prevent CSS injection.
 */
export function sanitizeWidgetPalette(input: unknown): Partial<CowSwapWidgetPalette> {
  if (!isPlainObject(input)) return {}

  const result: Partial<CowSwapWidgetPalette> = {}

  WIDGET_PALETTE_COLORS.forEach((key) => {
    const value = input[key]

    if (isValidColor(value)) {
      result[key] = value
    }
  })

  const { baseTheme, boxShadow } = input

  if (isBaseTheme(baseTheme)) {
    result.baseTheme = baseTheme
  }

  if (isValidBoxShadow(boxShadow)) {
    result.boxShadow = boxShadow
  }

  return result
}

function isBaseTheme(value: unknown): value is CowSwapTheme {
  return BASE_THEMES.some((theme) => theme === value)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidBoxShadow(value: unknown): value is string {
  if (typeof value !== 'string' || !BOX_SHADOW_CHARSET_REGEX.test(value)) return false

  return Array.from(value.matchAll(CSS_FUNCTION_REGEX)).every(([, name]) =>
    BOX_SHADOW_ALLOWED_FUNCTIONS.includes(name.toLowerCase()),
  )
}

function isValidColor(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    parseToRgba(value)
    return true
  } catch {
    return false
  }
}
