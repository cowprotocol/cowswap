import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook, waitFor } from '@testing-library/react'

import { usePriceChartHistory } from './usePriceChartHistory'

import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { Candle, ChartAsset, ChartMetric, SupplyVariant } from '../lib/chart.types'
import type { TimeRange } from '../simple/simplePriceChart.utils'

jest.mock('../api', () => ({ fetchPriceChartData: jest.fn(), fetchTokenSupply: jest.fn() }))

const ASSET: ChartAsset = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: SupportedChainId.MAINNET,
  symbol: 'USDC',
}
const BARS: Candle[] = [{ timestamp: 1, open: 1, high: 3, low: 1, close: 2, volume: 5 }]
const INITIAL_PROPS = {
  asset: ASSET as ChartAsset | undefined,
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
  return usePriceChartHistory(props.asset, props.period, props.metric, props.supplyVariant)
}

describe('usePriceChartHistory', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(fetchPriceChartData).mockResolvedValue(BARS)
    jest.mocked(fetchTokenSupply).mockResolvedValue({ circulatingSupply: 10, totalSupply: 20 })
  })

  it('does not request history without an asset or after its removal', async () => {
    const { result, rerender } = renderHook(useHistory, {
      wrapper: createWrapper(),
      initialProps: { ...INITIAL_PROPS, asset: undefined },
    })
    expect(result.current.isEnabled).toBe(false)
    expect(fetchPriceChartData).not.toHaveBeenCalled()

    rerender(INITIAL_PROPS)
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual(BARS))

    rerender({ ...INITIAL_PROPS, asset: undefined })
    expect(result.current.isEnabled).toBe(false)
  })

  it('reuses price history across metric and supply changes', async () => {
    const { result, rerender } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    expect(fetchTokenSupply).not.toHaveBeenCalled()

    rerender({ ...INITIAL_PROPS, metric: 'marketCap' })
    await waitFor(() => expect(result.current.data?.[0]?.close).toBe(20))
    expect(result.current.data?.[0]?.volume).toBe(5)

    rerender({ ...INITIAL_PROPS, metric: 'marketCap', supplyVariant: 'total' })
    await waitFor(() => expect(result.current.data?.[0]?.close).toBe(40))

    rerender({ ...INITIAL_PROPS, supplyVariant: 'total' })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    expect(fetchPriceChartData).toHaveBeenCalledTimes(1)
  })

  it('shares cached history across chart mounts', async () => {
    const wrapper = createWrapper()
    const first = renderHook(useHistory, { wrapper, initialProps: INITIAL_PROPS })
    await waitFor(() => expect(first.result.current.data).toEqual(BARS))
    first.unmount()

    const second = renderHook(useHistory, { wrapper, initialProps: INITIAL_PROPS })
    await waitFor(() => expect(second.result.current.data).toEqual(BARS))
    expect(fetchPriceChartData).toHaveBeenCalledTimes(1)
  })

  it('keeps previous bars during a range change and reports empty history after resolution', async () => {
    const { result, rerender } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    await waitFor(() => expect(result.current.data).toEqual(BARS))
    const next = deferredHistory()
    jest.mocked(fetchPriceChartData).mockReturnValueOnce(next.promise)

    rerender({ ...INITIAL_PROPS, period: '1W' })
    expect(result.current.data).toEqual(BARS)
    expect(result.current.isPlaceholderData).toBe(true)
    await waitFor(() => expect(fetchPriceChartData).toHaveBeenCalledTimes(2))
    await act(async () => next.resolve([]))
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toEqual([])
  })

  it('does not display a late response from the previous chain', async () => {
    const first = deferredHistory()
    jest.mocked(fetchPriceChartData).mockReturnValueOnce(first.promise)
    const { result, rerender } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: INITIAL_PROPS })
    await waitFor(() => expect(fetchPriceChartData).toHaveBeenCalledTimes(1))
    const nextBars = [{ ...BARS[0], close: 7 }]
    jest.mocked(fetchPriceChartData).mockResolvedValueOnce(nextBars)

    rerender({ ...INITIAL_PROPS, asset: { ...ASSET, chainId: SupportedChainId.GNOSIS_CHAIN } })
    await waitFor(() => expect(result.current.data).toEqual(nextBars))
    await act(async () => first.resolve(BARS))
    expect(result.current.data).toEqual(nextBars)
    expect(fetchPriceChartData).toHaveBeenCalledTimes(2)
  })

  it.each(['price', 'marketCap'] as const)('reports a %s request failure without stale bars', async (metric) => {
    if (metric === 'price') jest.mocked(fetchPriceChartData).mockRejectedValueOnce(new Error('History unavailable'))
    else jest.mocked(fetchTokenSupply).mockRejectedValueOnce(new Error('Supply unavailable'))
    const { result } = renderHook(useHistory, { wrapper: createWrapper(), initialProps: { ...INITIAL_PROPS, metric } })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
