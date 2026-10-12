import { syncSimplePriceLines } from './priceChartSimpleReferenceLines.utils'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { IPriceLine, ISeriesApi } from 'lightweight-charts'

it('updates line prices and theme colors, expands the scale, and removes stale lines', () => {
  const firstLine = { applyOptions: jest.fn() } as unknown as IPriceLine
  const secondLine = { applyOptions: jest.fn() } as unknown as IPriceLine
  const applyOptions = jest.fn()
  const series = {
    applyOptions,
    createPriceLine: jest.fn().mockReturnValueOnce(firstLine).mockReturnValueOnce(secondLine),
    removePriceLine: jest.fn(),
  } as unknown as ISeriesApi<'Area' | 'Candlestick'>
  const priceLines = new Map<string, IPriceLine>()
  const lines: PriceChartReferenceLine<number>[] = [
    { id: 'first', label: 'Limit', price: 2 },
    { id: 'second', label: 'Second limit', price: 3 },
  ]

  syncSimplePriceLines(series, priceLines, lines, '#ffaa00')
  expect(series.createPriceLine).toHaveBeenCalledTimes(2)
  expect(series.createPriceLine).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ color: '#ffaa00', lineStyle: 1, lineWidth: 2 }),
  )
  const autoscale = applyOptions.mock.calls.at(-1)?.[0].autoscaleInfoProvider
  expect(autoscale(() => ({ priceRange: { minValue: 1, maxValue: 2 } }))).toEqual({
    priceRange: { minValue: 1, maxValue: 3 },
  })
  expect(autoscale(() => null)).toBeNull()

  syncSimplePriceLines(series, priceLines, [{ ...lines[0], label: 'Limit updated', price: 4 }], '#ffbb00')
  expect(firstLine.applyOptions).toHaveBeenLastCalledWith(
    expect.objectContaining({
      color: '#ffbb00',
      price: 4,
      title: 'Limit updated',
    }),
  )
  expect(series.removePriceLine).toHaveBeenCalledWith(secondLine)
  expect(priceLines.has('second')).toBe(false)

  syncSimplePriceLines(series, priceLines, [], '#ffbb00')
  expect(applyOptions).toHaveBeenLastCalledWith({ autoscaleInfoProvider: undefined })
  expect(priceLines.size).toBe(0)
})
