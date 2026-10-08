import { createStore, Provider } from 'jotai'

import { QueryClient } from '@tanstack/query-core'

import { fireEvent, render, type RenderResult, screen } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { HomePage } from './HomePage'

import type { RwaAssetsPage, RwaMarketOverview, RwaMarketOverviewItem } from '@/entities/asset'

const NVDA: RwaMarketOverviewItem = {
  ticker: 'NVDA',
  title: 'NVIDIA',
  logoUrl: null,
  change24h: 0.8,
  dexVolume24h: 12_400_000,
  series: [
    { time: 0, value: 1 },
    { time: 1, value: 2 },
  ],
}

const OVERVIEW: RwaMarketOverview = {
  totals: {
    onchainCap: 526_000_000,
    dexVolume24h: 29_000_000,
    onchainCapSeries: [
      { time: 0, value: 1 },
      { time: 1, value: 2 },
    ],
  },
  mostTraded: [{ ...NVDA, series: null }],
  gainers: [NVDA],
  losers: [],
  updatedAt: '2026-10-01T14:00:00.000Z',
  tradingTime: { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' },
  degraded: false,
}

const DEGRADED_ASSETS_PAGE: RwaAssetsPage = {
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  degraded: true,
}

function mockApi(overview: RwaMarketOverview | null, assetsPage: RwaAssetsPage | null = null): void {
  global.fetch = jest.fn((url: string) => {
    const body = url.endsWith('/market-overview') ? overview : url.includes('/assets?') ? assetsPage : null

    return Promise.resolve(
      body
        ? { ok: true, status: 200, json: () => Promise.resolve(body) }
        : { ok: false, status: 500, json: () => Promise.resolve({ error: 'Upstream failed' }) },
    )
  }) as unknown as typeof fetch
}

function renderHomePage(): RenderResult {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))

  return render(
    <Provider store={store}>
      <HomePage />
    </Provider>,
  )
}

describe('HomePage', () => {
  beforeAll(() => {
    // jsdom has no matchMedia, `TokenLogo` reads the color scheme through it
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  it('renders the heading and the search', () => {
    mockApi(OVERVIEW)
    renderHomePage()

    expect(screen.getByRole('heading', { level: 1, name: 'Explore tokenized real-world assets' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Search assets' })).toBeTruthy()
  })

  it('renders the cards from the overview', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    expect(await screen.findByText('$526M')).toBeTruthy()
    expect(screen.getByText('$29M')).toBeTruthy()
    expect(screen.getByText('$12.4M')).toBeTruthy()
    expect(screen.getByText('+0.80%')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /NVIDIA/ })[0]?.getAttribute('href')).toBe('/asset/NVDA')
  })

  it('renders rows without sparklines when series is null', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    await screen.findByText('$12.4M')
    const mostTraded = screen.getByRole('region', { name: 'Most traded' })

    expect(mostTraded.querySelector('svg')).toBeNull()
    expect(mostTraded.textContent).toContain('NVIDIA')
  })

  it('shows the empty text for an empty list', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    await screen.findByText('+0.80%')
    fireEvent.click(screen.getByRole('button', { name: 'Losers' }))

    expect(screen.getByText('No losers in the last 24 hours')).toBeTruthy()
  })

  it('shows dashes for null totals', async () => {
    mockApi({ ...OVERVIEW, totals: { onchainCap: null, dexVolume24h: null, onchainCapSeries: null }, degraded: true })
    renderHomePage()

    const totals = await screen.findByRole('region', { name: 'Market overview' })

    expect(await screen.findAllByText('—')).toHaveLength(2)
    expect(totals.querySelector('svg')).toBeNull()
  })

  it('tells degraded data apart from an empty market', async () => {
    mockApi({ ...OVERVIEW, mostTraded: [], gainers: [], degraded: true }, DEGRADED_ASSETS_PAGE)
    renderHomePage()

    expect(await screen.findAllByText('Data temporarily unavailable')).toHaveLength(2)
    expect(await screen.findAllByText('Market data is temporarily unavailable')).toHaveLength(1)
    expect(screen.queryByText('No DEX trades in the last 24 hours')).toBeNull()
    expect(screen.queryByText('No gainers in the last 24 hours')).toBeNull()
  })

  it('marks the monochrome Ondo logo for dark mode', () => {
    mockApi(OVERVIEW)
    const { container } = renderHomePage()

    expect(container.querySelector('img[src="/issuers/ondo.svg"]')?.className).toContain('monochromeLogo')
    expect(container.querySelector('img[src="/issuers/xstocks.svg"]')?.className ?? '').not.toContain('monochromeLogo')
  })

  it('shows an error when the overview fails', async () => {
    mockApi(null)
    renderHomePage()

    expect(await screen.findByText(/Failed to load the market overview/)).toBeTruthy()
  })
})
