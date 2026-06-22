import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import type * as CSS from 'csstype'

function asCssDimension(value: CSS.Properties['width']): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return
  if (typeof value === 'string' && value.includes('var(')) return

  return String(value)
}

function asPixels(value: CSS.Properties['maxHeight']): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value !== 'string' || value.includes('var(')) return

  const pxMatch = /^(\d+(?:\.\d+)?)px$/.exec(value)
  if (!pxMatch) return

  return Number(pxMatch[1])
}

/**
 * Maps iframeStyle sizing into deprecated top-level params for widget-lib releases
 * that predate `iframeStyle` (they only read `width` / `height` / `maxHeight`).
 */
export function getLegacyIframeDimensionParams(
  iframeStyle: CSS.Properties,
): Pick<CowSwapWidgetParams, 'width' | 'height' | 'maxHeight'> {
  return {
    width: asCssDimension(iframeStyle.width),
    height: asCssDimension(iframeStyle.height),
    maxHeight: asPixels(iframeStyle.maxHeight),
  }
}
