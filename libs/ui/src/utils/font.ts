import { css } from 'styled-components/macro'

import { Font, FONT_SIZING, FontSizingName, FontWeight, FontWeightValue } from '../consts'
import { UI } from '../enum'

/**
 * Emits CSS longhands for a paired size/line-height token (and optional weight).
 * Use as a styled-components mixin, not as a `font:` value.
 *
 * @example
 * ```ts
 * ${font('FONT_NORMAL')}
 * ${font('FONT_MEDIUM', 'semibold')}
 * ${font('FONT_MEDIUM', Font.weight.semibold)}
 * ```
 */
export function font(fontSizingName: FontSizingName, fontWeight?: FontWeight): string {
  const fontSizing = FONT_SIZING[fontSizingName]

  if (!fontSizing) {
    throw new Error(`Invalid font key: ${fontSizingName}`)
  }

  const fontSizeAndHeight = `font-size: ${fontSizing[0]}px; line-height: ${fontSizing[1]}px;`

  return fontWeight ? `${fontSizeAndHeight} font-weight: ${resolveFontWeight(fontWeight)};` : fontSizeAndHeight
}

function resolveFontWeight(fontWeight: FontWeight): FontWeightValue {
  return typeof fontWeight === 'string' ? Font.weight[fontWeight] : fontWeight
}

/**
 * Studio Feixen brand face with OpenType settings used for CoW brand spots.
 * Declares features explicitly so they are not lost when the element leaves Inter inheritance.
 */
export const fontFamilyBrand = css`
  font-family: var(${UI.FONT_FAMILY_BRAND});
  font-variant: none;
  font-variant-ligatures: none;
  font-feature-settings:
    'liga' off,
    'kern' on;
`
