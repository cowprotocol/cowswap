import { transparentize } from 'color2k'

import { REFERENCE_LINE_STYLE } from '../config/priceChart.constants'

import type { PriceChartReferenceLine } from './priceChart.types'

export function getReferenceLineStyle(
  variant: PriceChartReferenceLine<number>['variant'],
  tradeColor: string,
  textColor: string,
): { color: string; lineStyle: typeof REFERENCE_LINE_STYLE.lineStyle; lineWidth: 1 | 2 } {
  if (!variant || variant === 'trade') return { color: tradeColor, ...REFERENCE_LINE_STYLE }
  return {
    color: transparentize(textColor, variant === 'unfillable-order' ? 0.5 : 0.3),
    lineStyle: REFERENCE_LINE_STYLE.lineStyle,
    lineWidth: 1 as const,
  }
}
