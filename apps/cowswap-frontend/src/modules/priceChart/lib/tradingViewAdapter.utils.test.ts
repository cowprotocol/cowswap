import { mapCandlesToTradingViewBars, mapResolutionToCandleInterval } from './tradingViewAdapter.utils'

import type { ResolutionString } from './loadChartingLibrary'
import type { Candle } from './priceChart.types'

describe('priceChartAdapter.utils', () => {
  it('maps supported TradingView resolutions to price chart resolutions', () => {
    expect(mapResolutionToCandleInterval('1' as ResolutionString)).toBe('1m')
    expect(mapResolutionToCandleInterval('1W' as ResolutionString)).toBe('7d')
    expect(mapResolutionToCandleInterval('30' as ResolutionString)).toBeNull()
  })

  it('maps price chart bars to TradingView bars', () => {
    const bars: Candle[] = [
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
        volume: 123.45,
      },
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        timestamp: 1710003600,
      },
    ]

    expect(mapCandlesToTradingViewBars(bars)).toEqual([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        time: 1710000000000,
        volume: 123.45,
      },
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        time: 1710003600000,
      },
    ])
  })
})
