import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'
import { IPriceLine, ISeriesApi } from 'lightweight-charts'

import { getSimpleSeriesMarkers, SimplePriceChartTooltip, syncSimplePriceLines } from './SimplePriceChart.pure'

import type { AttachedPriceChartExecutionMarker } from '../../lib/priceChartExecutionMarker.utils'
import type { PriceChartReferenceLine } from '../../lib/tradingView.types'

i18n.load('en-US', {})
i18n.activate('en-US')

describe('SimplePriceChartTooltip', () => {
  const data = { executions: [], placement: 'right' as const, price: 2, time: 1710000000, x: 100, y: 100 }

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

  it('shows executions attached to the hovered bar', () => {
    const execution = {
      ...executionMarker('order', 'buy', 0),
      activeAmount: '5.765',
      counterAmount: '0.8531',
      title: 'Bought 5.765 COW for 0.8531 USDC',
    }

    render(
      <I18nProvider i18n={i18n}>
        <SimplePriceChartTooltip data={{ ...data, executions: [execution] }} metric="price" />
      </I18nProvider>,
    )

    expect(screen.getByText('BUY')).toBeTruthy()
    expect(screen.getByText('5.765')).toBeTruthy()
    expect(screen.getByText('COW')).toBeTruthy()
    expect(screen.queryByText('0.8531')).toBeNull()
  })
})

it('maps every execution to a buy or sell arrow without collapsing the candle', () => {
  const markers: AttachedPriceChartExecutionMarker[] = [
    executionMarker('buy-1', 'buy', 0),
    executionMarker('buy-2', 'buy', 1),
    executionMarker('sell', 'sell', 0),
  ]

  expect(getSimpleSeriesMarkers(markers, false)).toEqual([
    { color: '#16a34a', id: 'buy-1', position: 'belowBar', shape: 'arrowUp', time: 100 },
    { color: '#16a34a', id: 'buy-2', position: 'belowBar', shape: 'arrowUp', time: 100 },
    { color: '#dc2626', id: 'sell', position: 'aboveBar', shape: 'arrowDown', time: 100 },
  ])
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
    expect.objectContaining({ color: 'rgba(67, 180, 69, 1)', lineStyle: 1, lineWidth: 2 }),
  )
  expect(series.createPriceLine).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ color: 'rgba(117, 124, 139, 1)', lineStyle: 1, lineWidth: 1 }),
  )

  syncSimplePriceLines(series, priceLines, [{ ...initialLines[0], label: 'Limit updated', price: 4 }])
  expect(tradeLine.applyOptions).toHaveBeenLastCalledWith(expect.objectContaining({ price: 4, title: 'Limit updated' }))
  expect(series.removePriceLine).toHaveBeenCalledWith(orderLine)
  expect(priceLines.has('order')).toBe(false)
})

function executionMarker(id: string, side: 'buy' | 'sell', stackIndex: number): AttachedPriceChartExecutionMarker {
  return {
    activeAmount: '1',
    activeTokenSymbol: 'COW',
    barPrice: 2,
    barTimestamp: 100,
    counterAmount: '2',
    counterTokenSymbol: 'USDC',
    id,
    side,
    stackIndex,
    timestamp: 110,
    title: `${side === 'buy' ? 'Bought' : 'Sold'} 1 COW for 2 USDC`,
  }
}
