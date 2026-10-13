import { useEffect } from 'react'

import type { QueryClient } from '@tanstack/react-query'

import { renderHook } from '@testing-library/react'

import { usePriceChartAdvancedExecutionMarkers } from './usePriceChartAdvancedExecutionMarkers'
import { usePriceChartAdvancedPriceSelection } from './usePriceChartAdvancedPriceSelection'
import { usePriceChartAdvancedReferenceLines } from './usePriceChartAdvancedReferenceLines'

import { createPriceChartDatafeed } from '../lib/priceChartAdvancedDatafeed.service'
import { createHorizontalLines } from '../lib/priceChartAdvancedReferenceLines.utils'

import type { AttachedPriceChartExecutionMarker } from '../lib/priceChartExecutionMarker.utils'
import type { IChartingLibraryWidget, LibrarySymbolInfo, ResolutionString } from 'charting_library'
import type { DefaultTheme } from 'styled-components'

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
      refreshMarks: jest.fn(),
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
  it('updates hover marks without recreating the datafeed or leaking another symbol’s executions', () => {
    jest.useFakeTimers()
    const widget = createWidget()
    const controller = createPriceChartDatafeed({ queryClient: {} as QueryClient, symbols: [] })
    const feed = controller.datafeed
    const marker = {
      id: 'order',
      side: 'buy',
      barTimestamp: 10,
      title: 'Bought 1 WETH',
    } as AttachedPriceChartExecutionMarker
    const { rerender, unmount } = renderHook(
      ({ ticker, markers }) => usePriceChartAdvancedExecutionMarkers(widget, ticker, markers, controller),
      { initialProps: { ticker: 'WETH', markers: [marker] } },
    )
    const callback = jest.fn()
    const symbol = { ticker: 'WETH' } as LibrarySymbolInfo
    feed.getMarks?.(symbol, 0, 20, callback, '1' as ResolutionString)
    jest.runOnlyPendingTimers()
    expect(callback).toHaveBeenLastCalledWith([
      expect.objectContaining({ label: '↑', text: 'Bought 1 WETH', time: 10 }),
    ])
    rerender({ ticker: 'USDC', markers: [] })
    expect(controller.datafeed).toBe(feed)
    feed.getMarks?.(symbol, 0, 20, callback, '1' as ResolutionString)
    jest.runOnlyPendingTimers()
    expect(callback).toHaveBeenLastCalledWith([])
    expect(() => unmount()).not.toThrow()
    controller.dispose()
    jest.useRealTimers()
  })

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
      usePriceChartAdvancedReferenceLines(widget, 'WETH', [], {
        success: '#fff',
        danger: '#f00',
        warning: '#00f',
      } as DefaultTheme)
    })

    expect(() => unmount()).not.toThrow()
    expect(removeLines).toHaveBeenCalledTimes(1)
    expect(widget.remove).toHaveBeenCalledTimes(1)
  })
})
