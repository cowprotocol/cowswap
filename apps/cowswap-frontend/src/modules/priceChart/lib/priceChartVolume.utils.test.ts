import { hasPriceChartVolume, syncTradingViewVolumeStudy } from './priceChartVolume.utils'

import type { IChartingLibraryWidget } from './loadChartingLibrary'
import type { Candle } from './priceChart.types'

const BAR: Candle = { close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }

describe('price chart volume', () => {
  it('detects optional volume, including zero', () => {
    expect(hasPriceChartVolume([BAR])).toBe(false)
    expect(hasPriceChartVolume([{ ...BAR, volume: 0 }])).toBe(true)
  })

  it('creates the Advanced volume study once when volume is available', () => {
    const createStudy = jest.fn().mockResolvedValue('volume-id')
    const chart = { createStudy, getAllStudies: jest.fn().mockReturnValue([]), removeEntity: jest.fn() }

    syncTradingViewVolumeStudy({ activeChart: () => chart } as unknown as IChartingLibraryWidget, true)

    expect(createStudy).toHaveBeenCalledWith('Volume', true, false)
    expect(chart.removeEntity).not.toHaveBeenCalled()
  })

  it('merges a saved Advanced volume pane when volume is available', () => {
    const mergeUp = jest.fn()
    const chart = {
      createStudy: jest.fn(),
      getStudyById: jest.fn().mockReturnValue({ mergeUp }),
      getAllStudies: jest.fn().mockReturnValue([{ id: 'volume-id', name: 'Volume' }]),
      removeEntity: jest.fn(),
    }

    syncTradingViewVolumeStudy({ activeChart: () => chart } as unknown as IChartingLibraryWidget, true)

    expect(mergeUp).toHaveBeenCalledTimes(1)
    expect(chart.createStudy).not.toHaveBeenCalled()
    expect(chart.removeEntity).not.toHaveBeenCalled()
  })

  it('removes Advanced volume studies when volume is unavailable', () => {
    const chart = {
      createStudy: jest.fn(),
      getAllStudies: jest.fn().mockReturnValue([
        { id: 'volume-id', name: 'Volume' },
        { id: 'other-id', name: 'Moving Average' },
      ]),
      removeEntity: jest.fn(),
    }

    syncTradingViewVolumeStudy({ activeChart: () => chart } as unknown as IChartingLibraryWidget, false)

    expect(chart.removeEntity).toHaveBeenCalledTimes(1)
    expect(chart.removeEntity).toHaveBeenCalledWith('volume-id', { disableUndo: true })
  })
})
