import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'
import { IPriceLine, ISeriesApi } from 'lightweight-charts'

import { SimplePriceChartTooltip, syncSimplePriceLines } from './SimplePriceChart.pure'

import type { PriceChartReferenceLine } from '../../lib/tradingView.types'

i18n.load('en-US', {})
i18n.activate('en-US')

describe('SimplePriceChartTooltip', () => {
  const data = { placement: 'right' as const, price: 2, time: 1710000000, x: 100, y: 100 }

  it('shows volume when the hovered bar contains it', () => {
    render(
      <I18nProvider i18n={i18n}>
        <SimplePriceChartTooltip data={{ ...data, volume: 123.45 }} metric="price" />
      </I18nProvider>,
    )

    expect(screen.getByText('Volume')).toBeTruthy()
    expect(screen.getByText('$123.45')).toBeTruthy()
  })

  it('hides volume when the hovered bar does not contain it', () => {
    render(
      <I18nProvider i18n={i18n}>
        <SimplePriceChartTooltip data={data} metric="price" />
      </I18nProvider>,
    )

    expect(screen.queryByText('Volume')).toBeNull()
  })
})

it('creates, updates, and removes reference lines by ID', () => {
  const tradeLine = { applyOptions: jest.fn() } as unknown as IPriceLine
  const orderLine = { applyOptions: jest.fn() } as unknown as IPriceLine
  const series = {
    createPriceLine: jest.fn().mockReturnValueOnce(tradeLine).mockReturnValueOnce(orderLine),
    removePriceLine: jest.fn(),
  } as unknown as ISeriesApi<'Area'>
  const priceLines = new Map<string, IPriceLine>()
  const initialLines: PriceChartReferenceLine<number>[] = [
    { id: 'trade', label: 'Limit', price: 2, variant: 'trade' },
    { id: 'order', label: 'Sell 60 COW', price: 3, variant: 'open-order' },
  ]

  syncSimplePriceLines(series, priceLines, initialLines)
  expect(series.createPriceLine).toHaveBeenCalledTimes(2)
  expect(series.createPriceLine).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ color: '#16a34a', lineStyle: 1, lineWidth: 2 }),
  )
  expect(series.createPriceLine).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ color: 'rgba(17, 24, 39, 0.7)', lineStyle: 1, lineWidth: 1 }),
  )

  syncSimplePriceLines(series, priceLines, [{ ...initialLines[0], label: 'Limit updated', price: 4 }])
  expect(tradeLine.applyOptions).toHaveBeenLastCalledWith(expect.objectContaining({ price: 4, title: 'Limit updated' }))
  expect(series.removePriceLine).toHaveBeenCalledWith(orderLine)
  expect(priceLines.has('order')).toBe(false)
})
