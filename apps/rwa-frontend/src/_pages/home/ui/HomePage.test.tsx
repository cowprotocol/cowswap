import { createStore, Provider } from 'jotai'

import { QueryClient } from '@tanstack/query-core'

import { fireEvent, render, type RenderResult, screen, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { HomePage } from './HomePage'

import type { RwaAssetListItem, RwaAssetsPage, RwaMarketOverview, RwaMarketOverviewItem } from '@/entities/asset'

const NVDA: RwaMarketOverviewItem = {
  ticker: 'NVDA',
  title: 'NVIDIA',
  logoUrl: null,
  change24h: 0.8,
  volume24h: 12_400_000,
  series: [
    { time: 0, value: 1 },
    { time: 1, value: 2 },
  ],
}

const OVERVIEW: RwaMarketOverview = {
  totals: {
    marketCap: 526_000_000,
    volume24h: 29_000_000,
    marketCapSeries: [
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

const NVDA_LIST_ITEM: RwaAssetListItem = {
  ticker: 'NVDA',
  coingeckoId: 'nvda',
  title: 'NVIDIA',
  type: 'stock',
  priority: 10,
  tokens: [
    {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000001',
      symbol: 'NVDAx',
      name: 'NVIDIA xStock',
      decimals: 18,
      issuer: 'xStocks',
    },
    {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000002',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
    },
  ],
  market: {
    price: 180,
    change24h: 0.8,
    dayLow: 175,
    dayHigh: 182,
    marketCap: 180_000_000,
    volume24h: 12_400_000,
    updatedAt: '2026-10-01T14:00:00.000Z',
    tokens: {},
  },
  series: null,
}

const ASSETS_PAGE: RwaAssetsPage = {
  items: [NVDA_LIST_ITEM],
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
  typeCounts: { stock: 3, index: 2 },
  issuers: ['Ondo', 'xStocks'],
  chainIds: [1],
  degraded: false,
}

const DEGRADED_ASSETS_PAGE: RwaAssetsPage = {
  ...ASSETS_PAGE,
  items: [],
  total: 0,
  totalPages: 0,
  typeCounts: { stock: 0, index: 0 },
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

  afterEach(() => {
    localStorage.clear()
  })

  it('renders the heading and the table filter', () => {
    mockApi(OVERVIEW)
    renderHomePage()

    expect(screen.getByRole('heading', { level: 1, name: 'Explore tokenized real-world assets' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Filter assets' })).toBeTruthy()
  })

  it('renders the type tabs with counts and the asset rows', async () => {
    mockApi(OVERVIEW, ASSETS_PAGE)
    renderHomePage()

    expect(await screen.findByRole('tab', { name: 'All assets 5' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Stocks 3' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'ETFs 2' })).toBeTruthy()
    expect(screen.getByText('2 issuers')).toBeTruthy()
    expect(screen.getByText('$180M')).toBeTruthy()
  })

  it('requests the selected type, issuer and sort', async () => {
    mockApi(OVERVIEW, ASSETS_PAGE)
    renderHomePage()

    fireEvent.click(await screen.findByRole('tab', { name: 'ETFs 2' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Issuer' }), { target: { value: 'Ondo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Asset' }))

    await waitFor(() =>
      expect(screen.getByRole('columnheader', { name: 'Asset' }).getAttribute('aria-sort')).toBe('ascending'),
    )
    const lastUrl = String((global.fetch as jest.Mock).mock.calls.at(-1)?.[0])

    expect(lastUrl).toContain('type=index')
    expect(lastUrl).toContain('issuer=Ondo')
    expect(lastUrl).toContain('sort=title')
    expect(lastUrl).toContain('order=asc')
  })

  it('sorts by 24h volume by default and ignores the v2 stored sort', async () => {
    localStorage.setItem('rwaAssetsSort:v2', JSON.stringify({ sort: 'marketCap', order: 'desc' }))
    mockApi(OVERVIEW, ASSETS_PAGE)
    renderHomePage()

    const header = await screen.findByRole('columnheader', { name: '24h volume' })

    expect(header.getAttribute('aria-sort')).toBe('descending')
    expect(screen.getByRole('columnheader', { name: 'Market cap' })).toBeTruthy()
    expect(
      (global.fetch as jest.Mock).mock.calls
        .map(([url]) => String(url))
        .some((url) => url.includes('/assets?') && url.includes('sort=volume24h')),
    ).toBe(true)
    expect(
      (global.fetch as jest.Mock).mock.calls
        .map(([url]) => String(url))
        .every((url) => !url.includes('/assets?') || !url.includes('sort=marketCap')),
    ).toBe(true)
  })

  it('requests 10 assets per page', async () => {
    mockApi(OVERVIEW, ASSETS_PAGE)
    renderHomePage()

    await screen.findByRole('tab', { name: 'All assets 5' })

    expect(
      (global.fetch as jest.Mock).mock.calls
        .map(([url]) => String(url))
        .some((url) => url.includes('/assets?') && url.includes('pageSize=10')),
    ).toBe(true)
  })

  it('labels the totals and most traded with the tokenized market figures', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    const totals = await screen.findByRole('region', { name: 'Market overview' })

    expect(totals.textContent).toContain('Market cap')
    expect(totals.textContent).toContain('24h volume')
    expect(totals.textContent).not.toContain('Onchain')
    expect(screen.getByText('24h volume · All networks')).toBeTruthy()
  })

  it('stores starred assets and requests them in the watchlist mode', async () => {
    mockApi(OVERVIEW, ASSETS_PAGE)
    renderHomePage()

    fireEvent.click(await screen.findByRole('button', { name: 'Save NVIDIA to watchlist' }))

    expect(screen.getByRole('button', { name: 'Remove NVIDIA from watchlist' })).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('rwaWatchlist:v1') ?? '[]')).toEqual(['NVDA'])

    fireEvent.click(screen.getByRole('button', { name: 'Watchlist' }))
    await screen.findByRole('button', { name: 'Watchlist', pressed: true })

    expect(String((global.fetch as jest.Mock).mock.calls.at(-1)?.[0])).toContain('tickers=NVDA')
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
    mockApi({ ...OVERVIEW, totals: { marketCap: null, volume24h: null, marketCapSeries: null }, degraded: true })
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
    expect(screen.queryByText('No trades in the last 24 hours')).toBeNull()
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
