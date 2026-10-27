import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/query-core'

import { act, renderHook, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { useAssetMarket } from './useAssetMarket'

import type { RwaAssetResponse, RwaChart, RwaChartPoint, RwaMarketData } from '@/entities/asset'

const TICKER = 'V'

const MARKET: RwaMarketData = {
  price: 402.38,
  change24h: -70.73,
  dayLow: 401.2,
  dayHigh: 1375.05,
  marketCap: 2_696_716,
  volume24h: 2291.01,
  updatedAt: '2026-10-19T08:01:30Z',
  tokens: {},
  sharesPerToken: {},
}

const ASSET: RwaAssetResponse = {
  ticker: TICKER,
  coingeckoId: 'visa',
  title: 'Visa',
  type: 'stock',
  priority: 0,
  tokens: [],
  market: MARKET,
  tradingPause: null,
  degraded: false,
}

const POINTS: RwaChartPoint[] = [
  { time: 1, value: 400 },
  { time: 2, value: 410 },
  { time: 3, value: 395 },
  { time: 4, value: 404 },
]

type FetchResult = Promise<object>

function chart(points: RwaChartPoint[]): RwaChart {
  return { ticker: TICKER, range: '1D', points }
}

function mockFetch(routes: { asset: () => FetchResult; chart: () => FetchResult }): jest.Mock {
  const fetchMock = jest
    .fn()
    .mockImplementation((url: string) => (url.includes('/chart/') ? routes.chart() : routes.asset()))
  global.fetch = fetchMock

  return fetchMock
}

function pending(): FetchResult {
  return new Promise(() => undefined)
}

function renderAssetMarket(): ReturnType<typeof renderHook<ReturnType<typeof useAssetMarket>, unknown>> {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

  return renderHook(() => useAssetMarket(TICKER), { wrapper })
}

function response(body: unknown, ok = true): FetchResult {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) })
}

async function settle(fetchMock: jest.Mock): Promise<void> {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
}

describe('useAssetMarket', () => {
  it('measures the 24h change and day range from the 1D chart to the price', async () => {
    const fetchMock = mockFetch({ asset: () => response(ASSET), chart: () => response(chart(POINTS)) })

    const { result } = renderAssetMarket()

    await waitFor(() =>
      expect(result.current.market).toEqual({
        ...MARKET,
        change24h: expect.closeTo(0.595),
        dayLow: 395,
        dayHigh: 410,
      }),
    )
    expect(result.current.data).toEqual(ASSET)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`/chart/${TICKER}?range=1D`))
  })

  it('keeps the price within the day range when it is below every chart point', async () => {
    const market = { ...MARKET, price: 390 }
    mockFetch({ asset: () => response({ ...ASSET, market }), chart: () => response(chart(POINTS)) })

    const { result } = renderAssetMarket()

    await waitFor(() =>
      expect(result.current.market).toEqual({ ...market, change24h: -2.5, dayLow: 390, dayHigh: 410 }),
    )
  })

  it('keeps the aggregate market while the chart is loading', async () => {
    mockFetch({ asset: () => response(ASSET), chart: pending })

    const { result } = renderAssetMarket()

    await waitFor(() => expect(result.current.market).toEqual(MARKET))
  })

  it('keeps the aggregate market when the chart fails', async () => {
    const fetchMock = mockFetch({
      asset: () => response(ASSET),
      chart: () => response({ error: 'Chart is down' }, false),
    })

    const { result } = renderAssetMarket()

    await settle(fetchMock)

    expect(result.current.market).toEqual(MARKET)
  })

  it('keeps the aggregate market when the chart has fewer than 2 points', async () => {
    const fetchMock = mockFetch({
      asset: () => response(ASSET),
      chart: () => response(chart([{ time: 1, value: 400 }])),
    })

    const { result } = renderAssetMarket()

    await settle(fetchMock)

    expect(result.current.market).toEqual(MARKET)
  })

  it('has no market until the asset loads, even with the chart loaded', async () => {
    const fetchMock = mockFetch({ asset: pending, chart: () => response(chart(POINTS)) })

    const { result } = renderAssetMarket()

    await settle(fetchMock)

    expect(result.current.market).toBeUndefined()
  })

  it('has no market when the asset fails', async () => {
    mockFetch({ asset: () => response({ error: 'Asset is down' }, false), chart: () => response(chart(POINTS)) })

    const { result } = renderAssetMarket()

    await waitFor(() => expect(result.current.error?.message).toBe('Asset is down'))
    expect(result.current.market).toBeUndefined()
  })
})
