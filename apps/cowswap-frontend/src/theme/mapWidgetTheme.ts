import { WIDGET_PALETTE_COLORS } from '@cowprotocol/widget-lib'
import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import type { DefaultTheme } from 'styled-components/macro'

const UNSAFE_CSS_VALUE_PATTERN = /[;{}<>`]/
const SAFE_COLOR_VALUE_PATTERN = /^(#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([\d\s.,%+-]+\)|[a-z]+)$/i
const SAFE_BOX_SHADOW_VALUE_PATTERN = /^[#(),.%\s0-9a-z-]+$/i

function isSafeColorValue(value: string): boolean {
  const normalizedValue = value.trim()

  return !UNSAFE_CSS_VALUE_PATTERN.test(normalizedValue) && SAFE_COLOR_VALUE_PATTERN.test(normalizedValue)
}

function isSafeBoxShadowValue(value: string): boolean {
  const normalizedValue = value.trim().toLowerCase()

  return (
    !UNSAFE_CSS_VALUE_PATTERN.test(normalizedValue) &&
    SAFE_BOX_SHADOW_VALUE_PATTERN.test(normalizedValue) &&
    !normalizedValue.includes('url(') &&
    !normalizedValue.includes('var(') &&
    !normalizedValue.includes('calc(') &&
    !normalizedValue.includes('expression(')
  )
}

function sanitizeWidgetTheme(widgetTheme: Partial<CowSwapWidgetPalette>): Partial<CowSwapWidgetPalette> {
  const sanitizedTheme: Partial<CowSwapWidgetPalette> = {}

  if (widgetTheme.baseTheme === 'dark' || widgetTheme.baseTheme === 'light') {
    sanitizedTheme.baseTheme = widgetTheme.baseTheme
  }

  for (const colorKey of WIDGET_PALETTE_COLORS) {
    const colorValue = widgetTheme[colorKey]

    if (typeof colorValue === 'string' && isSafeColorValue(colorValue)) {
      sanitizedTheme[colorKey] = colorValue
    }
  }

  if (typeof widgetTheme.boxShadow === 'string' && isSafeBoxShadowValue(widgetTheme.boxShadow)) {
    sanitizedTheme.boxShadow = widgetTheme.boxShadow
  }

  return sanitizedTheme
}

// Map the provided data from consumer to styled-components theme
export function mapWidgetTheme(
  widgetTheme: Partial<CowSwapWidgetPalette> | undefined,
  defaultTheme: DefaultTheme,
): DefaultTheme {
  if (!widgetTheme) return defaultTheme

  const sanitizedWidgetTheme = sanitizeWidgetTheme(widgetTheme)
  const { boxShadow, paper, ...widgetPalette } = sanitizedWidgetTheme

  return {
    ...defaultTheme,
    ...widgetPalette,
    ...(paper ? { paper, buttonTextCustom: paper } : null),
    ...(boxShadow ? { boxShadow1: boxShadow } : null),
  }
}
