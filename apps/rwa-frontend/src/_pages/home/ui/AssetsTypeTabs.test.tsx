import { createStore, Provider } from 'jotai'

import { fireEvent, render, type RenderResult, screen, waitFor } from '@testing-library/react'

import { AssetsTypeTabs } from './AssetsTypeTabs'

const RAIL_RECT = { left: 26, right: 349 }
const PILL_RECTS: Record<string, { left: number; right: number }> = {
  All: { left: -30, right: 20 },
  Stocks: { left: 100, right: 180 },
  ETFs: { left: 184, right: 250 },
  Commodities: { left: 254, right: 376 },
}

function mockRail(scrollWidth: number): jest.Mock {
  const scrollBy = jest.fn()

  Element.prototype.scrollBy = scrollBy
  jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth)
  jest.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(323)
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return { ...(PILL_RECTS[this.textContent ?? ''] ?? RAIL_RECT) } as DOMRect
  })

  return scrollBy
}

function renderTabs(): RenderResult {
  return render(
    <Provider store={createStore()}>
      <AssetsTypeTabs tableId="assets" />
    </Provider>,
  )
}

function saveType(type: string): void {
  localStorage.setItem(
    'rwaAssetsFilters:v1',
    JSON.stringify({ type, issuers: [], chainIds: [], minMarketCap: null, minVolume24h: null }),
  )
}

describe('AssetsTypeTabs', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('brings a saved type into view inside the rail, with its gutter', async () => {
    const scrollBy = mockRail(380)
    saveType('commodity')
    renderTabs()

    await waitFor(() => expect(scrollBy).toHaveBeenCalledWith({ left: 43 }))
  })

  it('scrolls back to a focused pill past the start of the rail', () => {
    const scrollBy = mockRail(380)
    renderTabs()
    scrollBy.mockClear()

    fireEvent.focus(screen.getByRole('button', { name: 'All' }))

    expect(scrollBy).toHaveBeenCalledWith({ left: -72 })
  })

  it('leaves the rail alone when a pill is already in view', () => {
    const scrollBy = mockRail(380)
    renderTabs()
    scrollBy.mockClear()

    fireEvent.focus(screen.getByRole('button', { name: 'Stocks' }))

    expect(scrollBy).not.toHaveBeenCalled()
  })

  it('does not scroll when every pill fits', async () => {
    const scrollBy = mockRail(323)
    saveType('commodity')
    renderTabs()

    await screen.findByRole('button', { name: 'Commodities', pressed: true })

    expect(scrollBy).not.toHaveBeenCalled()
  })
})
