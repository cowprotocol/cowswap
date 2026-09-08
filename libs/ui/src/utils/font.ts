import { css } from 'styled-components/macro'

import { Font, FONT_SIZING, FontSizingName, FontWeight, FontWeightKey, FontWeightValue } from '../consts'
import { UI } from '../enum'

const FONT_WEIGHT_CSS_VARS = {
  ultralight: UI.FONT_WEIGHT_ULTRALIGHT,
  light: UI.FONT_WEIGHT_LIGHT,
  regular: UI.FONT_WEIGHT_NORMAL,
  book: UI.FONT_WEIGHT_BOOK,
  medium: UI.FONT_WEIGHT_MEDIUM,
  semibold: UI.FONT_WEIGHT_SEMIBOLD,
  bold: UI.FONT_WEIGHT_BOLD,
} as const satisfies Record<FontWeightKey, UI>

const FONT_WEIGHT_KEY_BY_VALUE = {
  [Font.weight.ultralight]: 'ultralight',
  [Font.weight.light]: 'light',
  [Font.weight.regular]: 'regular',
  [Font.weight.book]: 'book',
  [Font.weight.medium]: 'medium',
  [Font.weight.semibold]: 'semibold',
  [Font.weight.bold]: 'bold',
} as const satisfies Record<FontWeightValue, FontWeightKey>

/**
 * Emits CSS longhands for a paired size/line-height token (and optional weight).
 * Use as a styled-components mixin, not as a `font:` value.
 * Weight is emitted as a theme CSS variable, not a numeric `Font.weight` constant.
 *
 * @example
 * ```ts
 * ${font('FONT_NORMAL')}
 * ${font('FONT_MEDIUM', 'semibold')}
 * ```
 */
export function font(fontSizingName: FontSizingName, fontWeight?: FontWeight): string {
  const fontSizing = FONT_SIZING[fontSizingName]

  if (!fontSizing) {
    throw new Error(`Invalid font key: ${fontSizingName}`)
  }

  const fontSizeAndHeight = `font-size: ${fontSizing[0]}px; line-height: ${fontSizing[1]}px;`

  return fontWeight ? `${fontSizeAndHeight} font-weight: ${resolveFontWeightCss(fontWeight)};` : fontSizeAndHeight
}

function resolveFontWeightCss(fontWeight: FontWeight): string {
  const weightKey = typeof fontWeight === 'string' ? fontWeight : FONT_WEIGHT_KEY_BY_VALUE[fontWeight]

  return `var(${FONT_WEIGHT_CSS_VARS[weightKey]})`
}

/**
 * Studio Feixen Sans for large, expressive CoW brand storytelling.
 * Declares OpenType features explicitly so they are not lost when the element leaves Inter inheritance.
 */
export const fontFamilyBrand = css`
  font-family: var(${UI.FONT_FAMILY_BRAND});
  font-variant: none;
  font-variant-ligatures: none;
  font-feature-settings:
    'liga' off,
    'kern' on;
`
