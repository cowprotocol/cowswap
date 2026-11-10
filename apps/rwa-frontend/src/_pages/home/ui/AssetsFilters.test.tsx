import { createStore, Provider } from 'jotai'

import { QueryClient } from '@tanstack/query-core'

import { act, fireEvent, render, type RenderResult, screen, waitFor, within } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { AssetsFilters } from './AssetsFilters'

import type { RwaAssetsPage } from '@/entities/asset'

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

const PHONE = 390
const TABLET = 800
const DESKTOP = 1280

type ChangeListener = () => void

function mockViewport(initialWidth: number): (width: number) => void {
  const listeners = new Map<ChangeListener, string>()
  let width = initialWidth

  const matchesAt = (query: string, atWidth: number): boolean => atWidth <= Number(query.match(/\d+/)?.[0])

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return matchesAt(query, width)
      },
      media: query,
      addEventListener: (_: string, listener: ChangeListener) => listeners.set(listener, query),
      removeEventListener: (_: string, listener: ChangeListener) => listeners.delete(listener),
    }),
  })

  return (next) => {
    const flipped = [...listeners].filter(([, query]) => matchesAt(query, width) !== matchesAt(query, next))

    width = next

    // Browsers fire each MediaQueryList separately and React commits between them, which can remove a later listener
    flipped.forEach(([listener]) => {
      if (listeners.has(listener)) act(() => listener())
    })
  }
}

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

  describe('at phone width', () => {
    it('shortens the search placeholder and keeps the names of the icon buttons', async () => {
      mockViewport(PHONE)
      renderFilters()

      await screen.findByText('128 assets')

      expect(screen.getByRole('searchbox', { name: 'Search assets' }).getAttribute('placeholder')).toBe(
        'Search assets…',
      )
      expect(screen.getByRole('button', { name: 'Watchlist' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Filters' })).toBeTruthy()
    })

    it('shortens the search placeholder again at the narrowest width', async () => {
      mockViewport(320)
      renderFilters()

      await screen.findByText('128 assets')

      expect(screen.getByRole('searchbox', { name: 'Search assets' }).getAttribute('placeholder')).toBe('Search…')
    })

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

    it('points the trigger at the drawer only while it is open', async () => {
      mockViewport(PHONE)
      renderFilters()

      await screen.findByText('128 assets')
      const trigger = screen.getByRole('button', { name: 'Filters' })

      expect(trigger.hasAttribute('aria-controls')).toBe(false)

      const drawer = await openFilters()

      expect(trigger.getAttribute('aria-controls')).toBe(drawer.id)
    })
  })

  describe('above phone width', () => {
    it('keeps the full search placeholder', async () => {
      mockViewport(DESKTOP)
      renderFilters()

      await screen.findByText('128 assets')

      expect(screen.getByRole('searchbox', { name: 'Search assets' }).getAttribute('placeholder')).toBe(
        'Search assets or tickers…',
      )
    })

    it('opens the popover with the search and folded list', async () => {
      mockViewport(DESKTOP)
      renderFilters()

      const panel = within(await openFilters())

      expect(panel.getByRole('searchbox', { name: 'Search issuers…' })).toBeTruthy()
      expect(panel.getByRole('button', { name: 'Only Ondo' })).toBeTruthy()
      expect(panel.getByRole('button', { name: /^\+ 2 more:/ })).toBeTruthy()
    })

    it('closes the popover on a press outside it', async () => {
      mockViewport(DESKTOP)
      renderFilters()

      await openFilters()
      fireEvent.pointerDown(document.body)

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())
    })
  })

  describe('at tablet width', () => {
    it('shortens the search placeholder and keeps the names of the icon buttons', async () => {
      mockViewport(TABLET)
      renderFilters()

      await screen.findByText('128 assets')

      expect(screen.getByRole('searchbox', { name: 'Search assets' }).getAttribute('placeholder')).toBe(
        'Search assets…',
      )
      expect(screen.getByRole('button', { name: 'Watchlist' })).toBeTruthy()
    })

    it('still opens the popover with the search and folded list', async () => {
      mockViewport(TABLET)
      renderFilters()

      const panel = within(await openFilters())

      expect(panel.getByRole('searchbox', { name: 'Search issuers…' })).toBeTruthy()
      expect(panel.getByRole('button', { name: /^\+ 2 more:/ })).toBeTruthy()
    })

    it('keeps the popover open when the width changes without reaching phone width', async () => {
      const setWidth = mockViewport(TABLET)
      renderFilters()

      await openFilters()
      setWidth(DESKTOP)

      expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy()
    })
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
