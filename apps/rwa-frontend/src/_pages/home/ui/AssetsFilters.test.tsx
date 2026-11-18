import { createStore, Provider } from 'jotai'

import { QueryClient } from '@tanstack/query-core'

import { fireEvent, render, type RenderResult, screen, waitFor, within } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { AssetsFilters } from './AssetsFilters'
// Loaded up front, so that opening the drawer doesn't wait for its dynamic import
import './AssetsFiltersDrawer'

import type { RwaAssetsPage } from '@/entities/asset'

import { mockViewport } from '@/shared/lib/testing'

const ISSUERS = ['Coinbase', 'Ondo', 'Paxos', 'Reality', 'Tether', 'bStocks', 'xStocks']
const CHAIN_IDS = [1, 56, 100, 137, 8453, 42161, 43114, 57073]

const ASSETS_PAGE: RwaAssetsPage = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 128,
  typeTotal: 128,
  totalPages: 13,
  issuers: ISSUERS,
  chainIds: CHAIN_IDS,
  degraded: false,
}

const NARROWEST = 320
const PHONE = 390
const TABLET = 800
const DESKTOP = 1280

async function openFilters(): Promise<HTMLElement> {
  await screen.findByText('128 assets')
  fireEvent.click(screen.getByRole('button', { name: 'Filters' }))

  return screen.findByRole('dialog', { name: 'Filters' })
}

function renderFilters(): RenderResult {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(ASSETS_PAGE) }),
  ) as unknown as typeof fetch

  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))

  return render(
    <Provider store={store}>
      <AssetsFilters />
    </Provider>,
  )
}

describe('AssetsFilters', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it.each([
    [NARROWEST, 'Search…'],
    [PHONE, 'Search assets…'],
    [TABLET, 'Search assets…'],
    [DESKTOP, 'Search assets or tickers…'],
  ])('fits the search placeholder at %ipx and keeps the names of the toolbar buttons', async (width, placeholder) => {
    mockViewport(width)
    renderFilters()

    await screen.findByText('128 assets')

    expect(screen.getByRole('searchbox', { name: 'Search assets' }).getAttribute('placeholder')).toBe(placeholder)
    expect(screen.getByRole('button', { name: 'Watchlist' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Filters' })).toBeTruthy()
  })

  describe('at phone width', () => {
    it('opens a drawer with every option and no list search', async () => {
      mockViewport(PHONE)
      renderFilters()

      const drawer = within(await openFilters())

      expect(drawer.getByRole('checkbox', { name: 'xStocks' })).toBeTruthy()
      expect(drawer.getByRole('checkbox', { name: 'Ink' })).toBeTruthy()
      expect(drawer.queryByRole('searchbox')).toBeNull()
      expect(drawer.queryByRole('button', { name: 'Only Ondo' })).toBeNull()
      expect(drawer.queryByRole('button', { name: /more:/ })).toBeNull()
    })

    it('stays open while filters change and closes from the button with the result count', async () => {
      mockViewport(PHONE)
      renderFilters()

      const drawer = within(await openFilters())

      fireEvent.pointerDown(drawer.getByRole('checkbox', { name: 'Ondo' }))
      fireEvent.click(drawer.getByRole('checkbox', { name: 'Ondo' }))

      expect(drawer.getByRole('checkbox', { name: 'Ondo' })).toHaveProperty('checked', true)
      expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy()
      expect(drawer.getByRole('button', { name: 'Clear all' })).toBeTruthy()

      fireEvent.click(drawer.getByRole('button', { name: 'Show 128 assets' }))

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Filters/, hidden: true }))
    })
  })

  describe.each([
    ['tablet', TABLET],
    ['desktop', DESKTOP],
  ])('at %s width', (_, width) => {
    it('opens the popover with the search and folded list', async () => {
      mockViewport(width)
      renderFilters()

      const panel = within(await openFilters())

      expect(panel.getByRole('searchbox', { name: 'Search issuers…' })).toBeTruthy()
      expect(panel.getByRole('button', { name: 'Only Ondo' })).toBeTruthy()
      expect(panel.getByRole('button', { name: /^\+ 2 more:/ })).toBeTruthy()
    })

    it('closes the popover on a press outside it', async () => {
      mockViewport(width)
      renderFilters()

      await openFilters()
      fireEvent.pointerDown(document.body)

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())
    })

    it('closes the popover on Escape, returning the focus to the trigger', async () => {
      mockViewport(width)
      renderFilters()

      await openFilters()
      fireEvent.keyDown(document.body, { key: 'Escape' })

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filters' }))
    })

    it('keeps the list search text after Escape closes the popover', async () => {
      mockViewport(width)
      renderFilters()

      const panel = within(await openFilters())
      const search = panel.getByRole('searchbox', { name: 'Search issuers…' })
      fireEvent.change(search, { target: { value: 'Ondo' } })
      fireEvent.keyDown(search, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())

      const reopened = within(await openFilters())

      expect(reopened.getByRole('searchbox', { name: 'Search issuers…' })).toHaveProperty('value', 'Ondo')
    })
  })

  it.each([
    ['drawer', PHONE],
    ['popover', DESKTOP],
  ])('points the trigger at the %s only while it is open', async (_, width) => {
    mockViewport(width)
    renderFilters()

    await screen.findByText('128 assets')
    const trigger = screen.getByRole('button', { name: 'Filters' })

    expect(trigger.hasAttribute('aria-controls')).toBe(false)

    const filters = await openFilters()

    expect(trigger.getAttribute('aria-controls')).toBe(filters.id)
  })

  it('keeps the popover open when the width changes without reaching phone width', async () => {
    const setWidth = mockViewport(TABLET)
    renderFilters()

    await openFilters()
    setWidth(DESKTOP)

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy()
  })

  it.each([
    ['the drawer', PHONE, TABLET],
    ['the popover', TABLET, PHONE],
  ])(
    'closes %s when the width crosses the breakpoint, keeping the focus on the trigger',
    async (_, fromWidth, toWidth) => {
      const setWidth = mockViewport(fromWidth)
      renderFilters()

      await openFilters()
      setWidth(toWidth)

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filters' }))
    },
  )
})
