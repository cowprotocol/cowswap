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
      colorFallback: 'rgba(67, 180, 69, 1)',
      // colorToken: '--cow-heeey',
      colorToken: UI.COLOR_WARNING,
      lineStyle: 1,
      lineWidth: 2,
    }
  }

  if (variant === 'unfillable-order') {
    return {
      colorFallback: 'rgba(240, 24, 39, 0.6)',
      colorToken: UI.COLOR_TEXT_OPACITY_50,
      lineStyle: 1,
      lineWidth: 1,
    }
  }

  return {
    colorFallback: 'rgba(117, 124, 139, 1)',
    colorToken: '--cow-heeey',
    lineStyle: 1,
    lineWidth: 1,
  }
}
