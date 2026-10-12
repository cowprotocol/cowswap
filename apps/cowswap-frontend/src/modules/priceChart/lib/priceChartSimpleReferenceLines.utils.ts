import { getReferenceLineColor, getPriceChartReferenceLineAppearance } from './priceChartReferenceLine.utils'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { IPriceLine, ISeriesApi } from 'lightweight-charts'

export function syncSimplePriceLines(
  series: ISeriesApi<'Area' | 'Candlestick'>,
  priceLines: Map<string, IPriceLine>,
  referenceLines: PriceChartReferenceLine<number>[],
): void {
  const visibleLineIds = new Set(referenceLines.map((line) => line.id))

  priceLines.forEach((line, id) => {
    if (visibleLineIds.has(id)) return

    series.removePriceLine(line)
    priceLines.delete(id)
  })

  referenceLines.forEach((referenceLine) => {
    const appearance = getPriceChartReferenceLineAppearance(referenceLine.variant)
    const options = {
      axisLabelVisible: true,
      color: getReferenceLineColor(appearance.colorToken, appearance.colorFallback),
      lineStyle: appearance.lineStyle,
      lineWidth: appearance.lineWidth,
      price: referenceLine.price,
      title: referenceLine.label,
    }
    const existingLine = priceLines.get(referenceLine.id)

    if (existingLine) {
      existingLine.applyOptions(options)
    } else {
      priceLines.set(referenceLine.id, series.createPriceLine(options))
    }
  })
}
