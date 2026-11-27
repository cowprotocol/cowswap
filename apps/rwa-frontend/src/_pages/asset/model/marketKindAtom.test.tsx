import { createStore, Provider, useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/query-core'

import { act, renderHook, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import {
  isStockOutageAtomFamily,
  isStockUnavailableAtomFamily,
  marketKindAtom,
  shownMarketKindAtomFamily,
} from './marketKindAtom'

import type { RwaAssetStock, RwaMarketKind } from '@/entities/asset'

const TICKER = 'NVDA'

const STOCK: RwaAssetStock = {
  ticker: TICKER,
  market: {
    price: 200,
    change24h: 1,
    dayLow: 198,
    dayHigh: 202,
    yearLow: 164,
    yearHigh: 243,
    marketCap: null,
    volume24h: null,
    updatedAt: '2026-11-05T12:00:00.000Z',
    provider: 'Ondo',
  },
  degraded: false,
}

function mockStockResponse(body: unknown, ok = true): void {
  global.fetch = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }))
}

function renderShownMarketKind(): {
  result: { current: RwaMarketKind }
  store: ReturnType<typeof createStore>
} {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result } = renderHook(() => useAtomValue(shownMarketKindAtomFamily(TICKER)), { wrapper })

  return { result, store }
}

beforeEach(() => {
  localStorage.clear()
  shownMarketKindAtomFamily.remove(TICKER)
})

describe('shownMarketKindAtomFamily', () => {
  it('shows the stock market by default, also while it loads', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => undefined))
    const { result } = renderShownMarketKind()

    expect(result.current).toBe('stock')
  })

  it('shows the tokenized market of an asset without stock market data', async () => {
    mockStockResponse({ ...STOCK, market: null })
    const { result } = renderShownMarketKind()

    await waitFor(() => expect(result.current).toBe('tokenized'))
  })

  it('shows the tokenized market when the stock market fails', async () => {
    mockStockResponse({ error: 'Stock data is down' }, false)
    const { result } = renderShownMarketKind()

    await waitFor(() => expect(result.current).toBe('tokenized'))
  })

  it('tells a provider outage from an asset without stock market data', async () => {
    mockStockResponse({ ...STOCK, market: null })
    const { store } = renderShownMarketKind()
    const { result: notCovered } = renderHook(() => useAtomValue(isStockOutageAtomFamily(TICKER)), {
      wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(store.get(isStockUnavailableAtomFamily(TICKER))).toBe(true))
    expect(notCovered.current).toBe(false)

    mockStockResponse({ ...STOCK, market: null, degraded: true })
    const { store: outageStore } = renderShownMarketKind()

    await waitFor(() => expect(outageStore.get(isStockUnavailableAtomFamily(TICKER))).toBe(true))
    expect(outageStore.get(isStockOutageAtomFamily(TICKER))).toBe(true)
  })

  it('follows the picked market when stock data is available', async () => {
    mockStockResponse(STOCK)
    const { result, store } = renderShownMarketKind()

    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    expect(result.current).toBe('stock')

    act(() => store.set(marketKindAtom, 'tokenized'))
    expect(result.current).toBe('tokenized')
  })
})
