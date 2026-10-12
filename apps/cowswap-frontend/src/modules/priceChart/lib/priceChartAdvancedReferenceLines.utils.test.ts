import { HorizontalLineEntity, syncHorizontalLines } from '../lib/priceChartAdvancedReferenceLines.utils'

import type { IChartingLibraryWidget } from 'charting_library'

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
