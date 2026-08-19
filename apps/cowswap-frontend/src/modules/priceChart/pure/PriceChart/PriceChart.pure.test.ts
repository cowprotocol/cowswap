import { HorizontalLineEntity, syncHorizontalLines } from './PriceChart.pure'

import type { IChartingLibraryWidget } from '../../lib/charting_library'

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
        'linetoolhorzline.linecolor': 'rgba(17, 24, 39, 0.7)',
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
