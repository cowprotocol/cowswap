import { hasPriceChartVolume, mapPriceChartBarsToVolumeData } from './priceChartVolume.utils'

import type { Candle } from '../lib/chart.types'

const BAR: Candle = { close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }

describe('price chart volume', () => {
  it('detects optional volume, including zero', () => {
    expect(hasPriceChartVolume([BAR])).toBe(false)
    expect(hasPriceChartVolume([{ ...BAR, volume: 0 }])).toBe(true)
  })

  it('maps only bars that contain volume to Simple histogram data', () => {
    expect(mapPriceChartBarsToVolumeData([BAR, { ...BAR, timestamp: 1710003600, volume: 0 }])).toEqual([
      { time: 1710003600, value: 0 },
    ])
  })
})
