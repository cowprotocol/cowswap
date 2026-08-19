import { mapPriceChartBarsToTradingViewBars, mapResolutionToPriceChartResolution } from './tradingViewAdapter.utils'

import type { ResolutionString } from './charting_library'
import type { PriceChartBar } from './priceChart.types'

describe('priceChartAdapter.utils', () => {
  it('maps supported TradingView resolutions to price chart resolutions', () => {
    expect(mapResolutionToPriceChartResolution('1' as ResolutionString)).toBe('1')
    expect(mapResolutionToPriceChartResolution('1W' as ResolutionString)).toBe('7D')
    expect(mapResolutionToPriceChartResolution('30' as ResolutionString)).toBeNull()
  })

  it('maps price chart bars to TradingView bars', () => {
    const bars: PriceChartBar[] = [
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        timestamp: 1710003600,
      },
    ]

    expect(mapPriceChartBarsToTradingViewBars(bars)).toEqual([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        time: 1710000000000,
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
