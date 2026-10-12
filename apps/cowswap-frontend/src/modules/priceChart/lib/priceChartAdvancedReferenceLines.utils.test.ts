import { createHorizontalLines } from './priceChartAdvancedReferenceLines.utils'

import type { IChartingLibraryWidget } from 'charting_library'

it('creates labelled lines and removes them even when cleanup precedes creation', async () => {
  const createShape = jest.fn().mockResolvedValue('entity-1')
  const removeEntity = jest.fn()
  const widget = { activeChart: () => ({ createShape, removeEntity }) } as unknown as IChartingLibraryWidget
  const cleanup = createHorizontalLines(widget, [{ id: 'limit', label: 'Limit', price: 2 }], '#ffaa00')
  expect(createShape).toHaveBeenCalledWith(
    expect.objectContaining({ price: 2 }),
    expect.objectContaining({
      text: 'Limit',
      disableSave: true,
      disableUndo: true,
      overrides: expect.objectContaining({
        'linetoolhorzline.linecolor': '#ffaa00',
        'linetoolhorzline.linestyle': 1,
      }),
    }),
  )
  cleanup()
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-1', { disableUndo: true })
})
