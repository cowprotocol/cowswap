import { attachExecutionMarkersToBars } from './priceChartExecutionMarker.utils'

import type { PriceChartBar } from './priceChart.types'
import type { PriceChartExecutionMarker } from './tradingView.types'

const BARS: PriceChartBar[] = [100, 160, 220].map((timestamp) => ({
  close: timestamp,
  high: timestamp,
  low: timestamp,
  open: timestamp,
  timestamp,
}))

it('attaches markers to their containing bars and keeps same-side stacks separate', () => {
  const result = attachExecutionMarkersToBars(
    [
      marker('buy-a', 110, 'buy'),
      marker('buy-b', 120, 'buy'),
      marker('sell', 130, 'sell'),
      marker('later', 170, 'buy'),
    ],
    BARS,
  )

  expect(
    result.map(({ barPrice, barTimestamp, id, stackIndex }) => ({ barPrice, barTimestamp, id, stackIndex })),
  ).toEqual([
    { barPrice: 100, barTimestamp: 100, id: 'buy-a', stackIndex: 0 },
    { barPrice: 100, barTimestamp: 100, id: 'buy-b', stackIndex: 1 },
    { barPrice: 100, barTimestamp: 100, id: 'sell', stackIndex: 0 },
    { barPrice: 160, barTimestamp: 160, id: 'later', stackIndex: 0 },
  ])
})

it('skips markers outside the loaded candle range', () => {
  expect(attachExecutionMarkersToBars([marker('before', 99), marker('after', 280)], BARS)).toEqual([])
})

function marker(id: string, timestamp: number, side: 'buy' | 'sell' = 'buy'): PriceChartExecutionMarker {
  return {
    activeAmount: '1',
    activeTokenSymbol: 'COW',
    counterAmount: '2',
    counterTokenSymbol: 'USDC',
    id,
    side,
    timestamp,
    title: id,
  }
}
