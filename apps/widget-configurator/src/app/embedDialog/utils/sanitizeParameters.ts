import { CowSwapWidgetPalette, CowSwapWidgetPaletteColors, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { ColorPalette } from '../../configurator/types'
import { SANITIZE_PARAMS } from '../const'

export function sanitizeParameters(params: CowSwapWidgetParams, defaultPalette: ColorPalette) {
  return {
    ...params,
    ...SANITIZE_PARAMS,
    theme: sanitizePalette(params, defaultPalette),
  }
}

// Keep only changed values
function sanitizePalette(params: CowSwapWidgetParams, defaultPalette: ColorPalette): CowSwapWidgetParams['theme'] {
  if (typeof params.theme === 'string' || !params.theme) return params.theme

  const palette = params.theme

  const paletteDiff = Object.keys(palette).reduce((acc, key: string) => {
    const colorKey = key as CowSwapWidgetPaletteColors

    if (defaultPalette[colorKey] !== palette[colorKey]) {
      acc[colorKey] = palette[colorKey]
    }

    return acc
  }, {} as CowSwapWidgetPalette)

  if (Object.keys(paletteDiff).length === 1 && paletteDiff.baseTheme) return paletteDiff.baseTheme

  return paletteDiff
}
