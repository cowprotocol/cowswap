import { useEffect } from 'react'

import { renderHook } from '@testing-library/react'

import { usePriceChartAdvancedPriceSelection } from './usePriceChartAdvancedPriceSelection'
import { usePriceChartAdvancedReferenceLines } from './usePriceChartAdvancedReferenceLines'

import { createHorizontalLines } from '../lib/priceChartAdvancedReferenceLines.utils'

import type { IChartingLibraryWidget } from 'charting_library'

jest.mock('../lib/priceChartAdvancedReferenceLines.utils', () => ({ createHorizontalLines: jest.fn() }))

function createWidget(): IChartingLibraryWidget {
  let removed = false
  const unsubscribe = jest.fn(() => {
    if (removed) throw new Error('Widget API has already been removed')
  })
  const subscription = { subscribe: jest.fn(), unsubscribe }
  return {
    activeChart: () => ({
      symbol: () => 'WETH',
      crossHairMoved: () => subscription,
      onDataLoaded: () => subscription,
    }),
    subscribe: jest.fn(),
    unsubscribe,
    remove: jest.fn(() => {
      removed = true
    }),
  } as unknown as IChartingLibraryWidget
}

function useWidgetRemoval(widget: IChartingLibraryWidget): void {
  useEffect(() => () => widget.remove(), [widget])
}

describe('Advanced chart cleanup', () => {
  it('detaches price selection listeners before removing the widget', () => {
    const widget = createWidget()
    const onSelectPrice = jest.fn()
    const { unmount } = renderHook(() => {
      useWidgetRemoval(widget)
      usePriceChartAdvancedPriceSelection(widget, 'WETH', onSelectPrice)
    })

    expect(() => unmount()).not.toThrow()
    expect(widget.unsubscribe).toHaveBeenCalledWith('mouse_up', expect.any(Function))
    expect(widget.remove).toHaveBeenCalledTimes(1)
  })

  it('detaches reference line listeners before removing the widget', () => {
    const widget = createWidget()
    const removeLines = jest.fn()
    jest.mocked(createHorizontalLines).mockReturnValue(removeLines)
    const { unmount } = renderHook(() => {
      useWidgetRemoval(widget)
      usePriceChartAdvancedReferenceLines(widget, 'WETH', [], '#fff')
    })

    expect(() => unmount()).not.toThrow()
    expect(removeLines).toHaveBeenCalledTimes(1)
    expect(widget.remove).toHaveBeenCalledTimes(1)
  })
})
