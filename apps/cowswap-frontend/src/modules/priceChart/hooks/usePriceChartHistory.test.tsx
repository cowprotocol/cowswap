import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { USDC_MAINNET, NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token, type Currency } from '@cowprotocol/currency'

import { act, renderHook, waitFor } from '@testing-library/react'

import { usePriceChartHistory } from './usePriceChartHistory'

import { fetchPriceHistory } from '../api/fetchPriceHistory'
import { fetchTokenSupply } from '../api/fetchTokenSupply'

import type { Candle, ChartMetric, SupplyVariant, TimeRange } from '../lib/priceChart.types'

jest.mock('../api/fetchPriceHistory', () => ({ fetchPriceHistory: jest.fn() }))
jest.mock('../api/fetchTokenSupply', () => ({ fetchTokenSupply: jest.fn() }))

const CURRENCY = USDC_MAINNET
const BARS: Candle[] = [{ timestamp: 1, open: 1, high: 3, low: 1, close: 2, volume: 5 }]
const INITIAL_PROPS = {
  currency: CURRENCY as Currency | undefined,
  period: '1D' as TimeRange,
  metric: 'price' as ChartMetric,
  supplyVariant: 'circulating' as SupplyVariant,
}

function createWrapper(): ({ children }: { children: ReactNode }) => ReactNode {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: 300_000, gcTime: Infinity, retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

function deferredHistory(): { promise: Promise<Candle[]>; resolve: (bars: Candle[]) => void } {
  let resolve: (bars: Candle[]) => void = () => {
    throw new Error('History promise is not initialized')
  }
  const promise = new Promise<Candle[]>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function useHistory(props: typeof INITIAL_PROPS): ReturnType<typeof usePriceChartHistory> {
  return usePriceChartHistory(props.currency, props.period, props.metric, props.supplyVariant)
}

describe('usePriceChartHistory', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(fetchPriceHistory).mockResolvedValue(BARS)
    jest.mocked(fetchTokenSupply).mockResolvedValue({ circulatingSupply: 10, totalSupply: 20 })
  })

  it('does not request history without a currency', () => {
    renderHook(useHistory, {
      wrapper: createWrapper(),
      initialProps: { ...INITIAL_PROPS, currency: undefined },
    })

    expect(fetchPriceHistory).not.toHaveBeenCalled()
  })

  it('fetches fresh prices for new metric and supply queries', async () => {
    const { result, rerender } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    expect(fetchTokenSupply).not.toHaveBeenCalled()

    rerender({ ...INITIAL_PROPS, metric: 'marketCap' })
    await waitFor(() => expect(result.current.data?.[0]?.close).toBe(20))

    rerender({ ...INITIAL_PROPS, metric: 'marketCap', supplyVariant: 'total' })
    await waitFor(() => expect(result.current.data?.[0]?.close).toBe(40))

    rerender({ ...INITIAL_PROPS, supplyVariant: 'total' })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    expect(fetchPriceHistory).toHaveBeenCalledTimes(3)
  })

  it('fetches fresh history every 30 seconds despite the default cache freshness', async () => {
    jest.useFakeTimers()
    const { result, unmount } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    try {
      await waitFor(() => expect(result.current.data).toEqual(BARS))
      const nextBars = [{ ...BARS[0], close: 7 }]
      jest.mocked(fetchPriceHistory).mockResolvedValueOnce(nextBars)

      await act(async () => {
        await jest.advanceTimersByTimeAsync(30_000)
      })

      await waitFor(() => expect(result.current.data).toEqual(nextBars))
      expect(fetchPriceHistory).toHaveBeenCalledTimes(2)
    } finally {
      unmount()
      jest.useRealTimers()
    }
  })

  it('requests new history when the range changes', async () => {
    const { result, rerender } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    const nextBars = [{ ...BARS[0], close: 7 }]
    jest.mocked(fetchPriceHistory).mockResolvedValueOnce(nextBars)

    rerender({ ...INITIAL_PROPS, period: '1W' })

    await waitFor(() => expect(result.current.data).toEqual(nextBars))
    expect(fetchPriceHistory).toHaveBeenCalledTimes(2)
    expect(fetchPriceHistory).toHaveBeenLastCalledWith(expect.objectContaining({ interval: '15m' }))
  })

  it('does not display a late response from the previous chain', async () => {
    const first = deferredHistory()
    jest.mocked(fetchPriceHistory).mockReturnValueOnce(first.promise)
    const { result, rerender } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    await waitFor(() => expect(fetchPriceHistory).toHaveBeenCalledTimes(1))
    const nextBars = [{ ...BARS[0], close: 7 }]
    jest.mocked(fetchPriceHistory).mockResolvedValueOnce(nextBars)

    rerender({
      ...INITIAL_PROPS,
      currency: new Token(SupportedChainId.GNOSIS_CHAIN, CURRENCY.address, CURRENCY.decimals, CURRENCY.symbol),
    })
    await waitFor(() => expect(result.current.data).toEqual(nextBars))
    await act(async () => first.resolve(BARS))
    expect(result.current.data).toEqual(nextBars)
    expect(fetchPriceHistory).toHaveBeenCalledTimes(2)
  })

  it('shares USD history between native and wrapped currencies', async () => {
    const nativeCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
    const wrappedCurrency = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
    const { result, rerender } = renderHook(useHistory, {
      wrapper: createWrapper(),
      initialProps: { ...INITIAL_PROPS, currency: nativeCurrency },
    })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    expect(fetchPriceHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: SupportedChainId.MAINNET,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      }),
    )

    rerender({ ...INITIAL_PROPS, currency: wrappedCurrency })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    expect(fetchPriceHistory).toHaveBeenCalledTimes(1)
  })
})
