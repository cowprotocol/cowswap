import { createExecutionMarkers } from './priceChartAdvancedExecutionMarkers.utils'

import type { AttachedPriceChartExecutionMarker } from './priceChartExecutionMarker.utils'
import type { IChartingLibraryWidget } from 'charting_library'

it('draws buy and sell arrows and removes shapes even when cleanup precedes creation', async () => {
  const createShape = jest.fn().mockResolvedValueOnce('buy-arrow').mockResolvedValueOnce('sell-arrow')
  const removeEntity = jest.fn()
  const widget = { activeChart: () => ({ createShape, removeEntity }) } as unknown as IChartingLibraryWidget
  const markers: AttachedPriceChartExecutionMarker[] = ['buy', 'sell'].map((side) => ({
    id: side,
    side: side as 'buy' | 'sell',
    timestamp: 100,
    barTimestamp: 100,
    barPrice: 2,
    stackIndex: 0,
    activeAmount: '1',
    activeTokenSymbol: 'COW',
    counterAmount: '2',
    counterTokenSymbol: 'USDC',
    title: side,
  }))
  const cleanup = createExecutionMarkers(widget, markers)
  expect(createShape).toHaveBeenNthCalledWith(
    1,
    { price: 2, time: 100 },
    expect.objectContaining({ shape: 'arrow_up', text: 'buy', disableSave: true }),
  )
  expect(createShape).toHaveBeenNthCalledWith(
    2,
    { price: 2, time: 100 },
    expect.objectContaining({ shape: 'arrow_down', text: 'sell', disableSave: true }),
  )
  cleanup()
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('buy-arrow', { disableUndo: true })
  expect(removeEntity).toHaveBeenCalledWith('sell-arrow', { disableUndo: true })
})
