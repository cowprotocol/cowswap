import {
  ExecutionMarkerEntity,
  HorizontalLineEntity,
  syncExecutionMarkers,
  syncHorizontalLines,
} from './PriceChart.pure'

import type { IChartingLibraryWidget } from '../../lib/charting_library'
import type { IExecutionLineAdapter } from '../../lib/charting_library/charting_library'
import type { AttachedPriceChartExecutionMarker } from '../../lib/priceChartExecutionMarker.utils'

const REFERENCE_LINE = { id: 'order', label: 'Sell 60 COW', price: 2, variant: 'open-order' as const }

it('creates, updates, removes, and recreates lines after a symbol change', () => {
  const createShape = jest
    .fn()
    .mockReturnValueOnce('entity-1')
    .mockReturnValueOnce('entity-2')
    .mockReturnValueOnce('entity-3')
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
  expect(removeEntity).toHaveBeenCalledWith('entity-1', { disableUndo: true })
  expect(createShape).toHaveBeenCalledTimes(2)

  syncHorizontalLines({
    entities,
    referenceLines: [{ ...REFERENCE_LINE, label: 'Sell 30 COW', price: 3 }],
    ticker: 'USDCUSD',
    widget,
  })
  expect(removeEntity).toHaveBeenCalledWith('entity-2', { disableUndo: true })
  expect(createShape).toHaveBeenCalledTimes(3)

  syncHorizontalLines({ entities, referenceLines: [], ticker: 'USDCUSD', widget })
  expect(removeEntity).toHaveBeenCalledWith('entity-3', { disableUndo: true })
  expect(entities.size).toBe(0)
})

it('creates, updates, removes, and recreates execution arrows after a symbol change', () => {
  const adapters = [executionAdapter(), executionAdapter(), executionAdapter()]
  const createExecutionShape = jest
    .fn()
    .mockReturnValueOnce(adapters[0])
    .mockReturnValueOnce(adapters[1])
    .mockReturnValueOnce(adapters[2])
  const widget = { activeChart: () => ({ createExecutionShape }) } as unknown as IChartingLibraryWidget
  const entities = new Map<string, ExecutionMarkerEntity>()
  const marker = executionMarker()

  syncExecutionMarkers({ darkMode: false, entities, markers: [marker], ticker: 'COWUSD', widget })
  expect(createExecutionShape).toHaveBeenCalledTimes(1)
  expect(adapters[0].setDirection).toHaveBeenCalledWith('buy')
  expect(adapters[0].setPrice).toHaveBeenCalledWith(2)
  expect(adapters[0].setTime).toHaveBeenCalledWith(100)
  expect(adapters[0].setArrowSpacing).toHaveBeenCalledWith(14)
  expect(adapters[0].setTooltip).toHaveBeenCalledWith('Bought 1 COW for 2 USDC')

  syncExecutionMarkers({ darkMode: false, entities, markers: [marker], ticker: 'COWUSD', widget })
  expect(createExecutionShape).toHaveBeenCalledTimes(1)

  syncExecutionMarkers({
    darkMode: false,
    entities,
    markers: [{ ...marker, title: 'Buy 2 COW' }],
    ticker: 'COWUSD',
    widget,
  })
  expect(adapters[0].remove).toHaveBeenCalled()
  expect(createExecutionShape).toHaveBeenCalledTimes(2)

  syncExecutionMarkers({
    darkMode: false,
    entities,
    markers: [{ ...marker, title: 'Buy 2 COW' }],
    ticker: 'USDCUSD',
    widget,
  })
  expect(adapters[1].remove).toHaveBeenCalled()
  expect(createExecutionShape).toHaveBeenCalledTimes(3)

  syncExecutionMarkers({ darkMode: false, entities, markers: [], ticker: 'USDCUSD', widget })
  expect(adapters[2].remove).toHaveBeenCalled()
  expect(entities.size).toBe(0)
})

function executionAdapter(): jest.Mocked<IExecutionLineAdapter> {
  const adapter = {
    remove: jest.fn(),
    setArrowColor: jest.fn(),
    setArrowHeight: jest.fn(),
    setArrowSpacing: jest.fn(),
    setDirection: jest.fn(),
    setPrice: jest.fn(),
    setText: jest.fn(),
    setTextColor: jest.fn(),
    setTime: jest.fn(),
    setTooltip: jest.fn(),
  } as unknown as jest.Mocked<IExecutionLineAdapter>

  Object.values(adapter).forEach((method) => method.mockReturnValue(adapter))

  return adapter
}

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
