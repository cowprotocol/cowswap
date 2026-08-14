import { Font, FONT_SIZING, FontSizingName, FontWeight, FontWeightValue } from '../consts'

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
