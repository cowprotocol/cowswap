import { renderHook } from '@testing-library/react'

import { usePriceChartAdvancedPriceSelection } from './usePriceChartAdvancedPriceSelection'

import { removeChartWidget } from '../lib/priceChartAdvancedWidget.utils'

import type { IChartingLibraryWidget } from 'charting_library'

function createWidget(): IChartingLibraryWidget {
  const crossHairMoved = { subscribe: jest.fn(), unsubscribe: jest.fn() }

  return {
    activeChart: () => ({ crossHairMoved: () => crossHairMoved, symbol: () => 'TICKER' }),
    remove: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  } as unknown as IChartingLibraryWidget
}

function render(widget: IChartingLibraryWidget | null): ReturnType<typeof renderHook> {
  return renderHook(({ w }) => usePriceChartAdvancedPriceSelection(w, 'TICKER', jest.fn()), {
    initialProps: { w: widget },
  }) as ReturnType<typeof renderHook>
}

it('unsubscribes from the widget while it is alive', () => {
  const widget = createWidget()

  render(widget).unmount()

  expect(widget.unsubscribe).toHaveBeenCalledWith('mouse_up', expect.any(Function))
})

// A chain switch rebuilds the widget: `remove()` can win the race against the teardown of the render that
// cleared the widget, and `widget.unsubscribe` then throws inside the library.
it('skips the widget teardown once the widget has been removed', () => {
  const widget = createWidget()
  const { unmount } = render(widget)

  removeChartWidget(widget)
  unmount()

  expect(widget.unsubscribe).not.toHaveBeenCalled()
})
