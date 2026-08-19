import { UI } from '@cowprotocol/ui'

import type { PriceChartReferenceLineVariant } from './tradingView.types'

export interface PriceChartReferenceLineAppearance {
  colorFallback: string
  colorToken: string
  lineStyle: 1 | 2
  lineWidth: 1 | 2
}

export function getPriceChartReferenceLineAppearance(
  variant: PriceChartReferenceLineVariant,
): PriceChartReferenceLineAppearance {
  if (variant === 'trade') {
    return {
      colorFallback: '#16a34a',
      colorToken: UI.COLOR_SUCCESS,
      lineStyle: 1,
      lineWidth: 2,
    }
  }

  if (variant === 'unfillable-order') {
    return {
      colorFallback: 'rgba(17, 24, 39, 0.5)',
      colorToken: UI.COLOR_TEXT_OPACITY_50,
      lineStyle: 1,
      lineWidth: 1,
    }
  }

  return {
    colorFallback: 'rgba(17, 24, 39, 0.7)',
    colorToken: UI.COLOR_TEXT_OPACITY_70,
    lineStyle: 1,
    lineWidth: 1,
  }
}
