import type { PriceChartReferenceLine } from './priceChart.types'
import type { DefaultTheme } from 'styled-components'

export function getReferenceLineColor(
  variant: PriceChartReferenceLine<number>['variant'],
  theme: DefaultTheme,
): string {
  return {
    trade: theme.warning,
    'worst-acceptable-price': theme.warning,
    'open-order': '#8A8A8A',
    'unfillable-order': theme.danger,
  }[variant]
}
