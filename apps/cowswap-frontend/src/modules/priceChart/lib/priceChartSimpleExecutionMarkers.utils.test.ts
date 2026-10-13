import { getSimpleExecutionMarkers } from './priceChartSimpleExecutionMarkers.utils'

import type { AttachedPriceChartExecutionMarker } from './priceChartExecutionMarker.utils'

it('places buy arrows below candles and sell arrows above them', () => {
  const markers: AttachedPriceChartExecutionMarker[] = ['buy', 'sell'].map((side) => ({
    id: side,
    side: side as 'buy' | 'sell',
    timestamp: 110,
    barTimestamp: 100,
    barPrice: 2,
    stackIndex: 0,
    activeAmount: '1',
    activeTokenSymbol: 'COW',
    counterAmount: '2',
    counterTokenSymbol: 'USDC',
    title: side,
  }))
  expect(getSimpleExecutionMarkers(markers)).toEqual([
    expect.objectContaining({ time: 100, id: 'buy', shape: 'arrowUp', position: 'belowBar' }),
    expect.objectContaining({ time: 100, id: 'sell', shape: 'arrowDown', position: 'aboveBar' }),
  ])
})
