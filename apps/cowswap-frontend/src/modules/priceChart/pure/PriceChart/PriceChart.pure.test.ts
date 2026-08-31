import {
  ExecutionMarkerEntity,
  HorizontalLineEntity,
  syncExecutionMarkers,
  syncHorizontalLines,
} from './PriceChart.pure'

import type { IChartingLibraryWidget } from '../../lib/charting_library'
import type { AttachedPriceChartExecutionMarker } from '../../lib/priceChartExecutionMarker.utils'

const REFERENCE_LINE = { id: 'order', label: 'Sell 60 COW', price: 2, variant: 'open-order' as const }

it('creates, updates, removes, and recreates lines after a symbol change', async () => {
  const createShape = jest
    .fn()
    .mockResolvedValueOnce('entity-1')
    .mockResolvedValueOnce('entity-2')
    .mockResolvedValueOnce('entity-3')
  const removeEntity = jest.fn()
  const widget = {
    activeChart: () => ({ createShape, removeEntity }),
  } as unknown as IChartingLibraryWidget
  const entities = new Map<string, HorizontalLineEntity>()

  syncHorizontalLines({ entities, referenceLines: [REFERENCE_LINE], ticker: 'COWUSD', widget })
  expect(createShape).toHaveBeenCalledTimes(1)
  expect(createShape).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({
      overrides: expect.objectContaining({
        'linetoolhorzline.linecolor': 'rgba(117, 124, 139, 1)',
        'linetoolhorzline.linestyle': 1,
      }),
    }),
  )

  syncHorizontalLines({
    entities,
    referenceLines: [{ ...REFERENCE_LINE, label: 'Sell 30 COW', price: 3 }],
    ticker: 'COWUSD',
    widget,
  })
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-1', { disableUndo: true })
  expect(createShape).toHaveBeenCalledTimes(2)

  syncHorizontalLines({
    entities,
    referenceLines: [{ ...REFERENCE_LINE, label: 'Sell 30 COW', price: 3 }],
    ticker: 'USDCUSD',
    widget,
  })
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-2', { disableUndo: true })
  expect(createShape).toHaveBeenCalledTimes(3)

  syncHorizontalLines({ entities, referenceLines: [], ticker: 'USDCUSD', widget })
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-3', { disableUndo: true })
  expect(entities.size).toBe(0)
})

it('creates, updates, removes, and recreates execution arrows after a symbol change', async () => {
  const createShape = jest
    .fn()
    .mockResolvedValueOnce('entity-1')
    .mockResolvedValueOnce('entity-2')
    .mockResolvedValueOnce('entity-3')
  const removeEntity = jest.fn()
  const widget = { activeChart: () => ({ createShape, removeEntity }) } as unknown as IChartingLibraryWidget
  const entities = new Map<string, ExecutionMarkerEntity>()
  const marker = executionMarker()

  syncExecutionMarkers({ darkMode: false, entities, markers: [marker], ticker: 'COWUSD', widget })
  expect(createShape).toHaveBeenCalledTimes(1)
  expect(createShape).toHaveBeenCalledWith(
    { price: 2, time: 100 },
    expect.objectContaining({
      overrides: expect.objectContaining({
        'linetoolarrowmarkup.arrowColor': '#16a34a',
        'linetoolarrowmarkup.showLabel': false,
      }),
      shape: 'arrow_up',
      text: 'Bought 1 COW for 2 USDC',
    }),
  )

  syncExecutionMarkers({ darkMode: false, entities, markers: [marker], ticker: 'COWUSD', widget })
  expect(createShape).toHaveBeenCalledTimes(1)

  syncExecutionMarkers({
    darkMode: false,
    entities,
    markers: [{ ...marker, title: 'Buy 2 COW' }],
    ticker: 'COWUSD',
    widget,
  })
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-1', { disableUndo: true })
  expect(createShape).toHaveBeenCalledTimes(2)

  syncExecutionMarkers({
    darkMode: false,
    entities,
    markers: [{ ...marker, title: 'Buy 2 COW' }],
    ticker: 'USDCUSD',
    widget,
  })
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-2', { disableUndo: true })
  expect(createShape).toHaveBeenCalledTimes(3)

  syncExecutionMarkers({ darkMode: false, entities, markers: [], ticker: 'USDCUSD', widget })
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-3', { disableUndo: true })
  expect(entities.size).toBe(0)
})

function executionMarker(): AttachedPriceChartExecutionMarker {
  return {
    activeAmount: '1',
    activeTokenSymbol: 'COW',
    barPrice: 2,
    barTimestamp: 100,
    counterAmount: '2',
    counterTokenSymbol: 'USDC',
    id: 'execution:1',
    side: 'buy',
    stackIndex: 1,
    timestamp: 110,
    title: 'Bought 1 COW for 2 USDC',
  }
}
