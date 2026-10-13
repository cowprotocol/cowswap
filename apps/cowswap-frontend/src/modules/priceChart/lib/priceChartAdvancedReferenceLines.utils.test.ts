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
        linecolor: '#ffaa00',
        linestyle: 1,
        linewidth: 2,
        textcolor: '#ffaa00',
        horzLabelsAlign: 'right',
        vertLabelsAlign: 'top',
        showPrice: true,
      }),
    }),
  )
  cleanup()
  await Promise.resolve()
  expect(removeEntity).toHaveBeenCalledWith('entity-1', { disableUndo: true })
})
