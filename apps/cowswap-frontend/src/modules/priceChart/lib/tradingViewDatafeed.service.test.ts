import { QueryClient } from '@tanstack/react-query'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { Token } from '@cowprotocol/currency'

import { createChartSymbols } from './symbolCatalog'
import { createPriceChartDatafeed } from './tradingViewDatafeed.service'

import { fetchPriceHistory } from '../api/fetchPriceHistory'
import { fetchTokenSupply } from '../api/fetchTokenSupply'

import type { Candle } from './priceChart.types'

jest.mock('../api/fetchPriceHistory', () => ({ fetchPriceHistory: jest.fn() }))
jest.mock('../api/fetchTokenSupply', () => ({ fetchTokenSupply: jest.fn() }))

const CURRENCY = USDC_MAINNET
const SYMBOLS = createChartSymbols([CURRENCY])
const [PRICE, CIRCULATING_CAP, TOTAL_CAP] = SYMBOLS
const BAR: Candle = { close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }
const PERIOD = { countBack: 300, firstDataRequest: true, from: BAR.timestamp, to: BAR.timestamp + 7200 }

const mockedFetchPriceHistory = jest.mocked(fetchPriceHistory)
const mockedFetchTokenSupply = jest.mocked(fetchTokenSupply)
let queryClient: QueryClient

function deferredHistory(): { promise: Promise<Candle[]>; resolve: (bars: Candle[]) => void } {
  let resolve!: (bars: Candle[]) => void
  const promise = new Promise<Candle[]>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function flushTasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('TradingView datafeed', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
    mockedFetchPriceHistory.mockReset().mockResolvedValue([BAR])
    mockedFetchTokenSupply.mockReset().mockResolvedValue({ circulatingSupply: 10, totalSupply: 20 })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
    queryClient.clear()
  })

  it('stops automatic requests when disabled and resumes without recreating the datafeed', async () => {
    jest.useFakeTimers({ now: PERIOD.to * 1000 })
    const controller = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })
    const onRealtime = jest.fn()
    controller.datafeed.subscribeBars(PRICE.librarySymbolInfo, '60', onRealtime, 'price', jest.fn())
    controller.setAutoRefreshEnabled(false)
    await jest.advanceTimersByTimeAsync(60_000)
    expect(mockedFetchPriceHistory).not.toHaveBeenCalled()

    controller.datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, jest.fn(), jest.fn())
    await jest.advanceTimersByTimeAsync(0)
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(1)
    controller.setAutoRefreshEnabled(true)
    await jest.advanceTimersByTimeAsync(30_000)
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(2)
    expect(onRealtime).toHaveBeenCalledTimes(1)
    controller.dispose()
  })

  it('updates the current candle and appends new candles without replaying older bars', async () => {
    jest.useFakeTimers({ now: PERIOD.to * 1000 })
    const onHistoryLoaded = jest.fn()
    const onRealtime = jest.fn()
    const controller = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS, onHistoryLoaded })
    controller.datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, jest.fn(), jest.fn())
    await jest.advanceTimersByTimeAsync(0)
    controller.datafeed.subscribeBars(PRICE.librarySymbolInfo, '60', onRealtime, 'price', jest.fn())
    const updated = { ...BAR, close: 3 }
    const next = { ...BAR, close: 4, timestamp: BAR.timestamp + 3600 }
    mockedFetchPriceHistory.mockResolvedValue([{ ...BAR, timestamp: BAR.timestamp - 3600 }, updated, next])

    await jest.advanceTimersByTimeAsync(30_000)

    expect(onRealtime.mock.calls.map(([bar]) => ({ time: bar.time, close: bar.close }))).toEqual([
      { time: updated.timestamp * 1000, close: 3 },
      { time: next.timestamp * 1000, close: 4 },
    ])
    expect(onHistoryLoaded).toHaveBeenLastCalledWith([updated, next])
    controller.dispose()
  })

  it('shares live prices across metric subscriptions and applies each supply variant', async () => {
    jest.useFakeTimers({ now: PERIOD.to * 1000 })
    const controller = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })
    const onPrice = jest.fn()
    const onCirculating = jest.fn()
    const onTotal = jest.fn()
    for (const [symbol, callback, uid] of [
      [PRICE, onPrice, 'price'],
      [CIRCULATING_CAP, onCirculating, 'cap'],
      [TOTAL_CAP, onTotal, 'total'],
    ] as const) {
      controller.datafeed.subscribeBars(symbol.librarySymbolInfo, '60', callback, uid, jest.fn())
    }

    await jest.advanceTimersByTimeAsync(30_000)

    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(1)
    expect(onPrice).toHaveBeenCalledWith(expect.objectContaining({ close: 2 }))
    expect(onCirculating).toHaveBeenCalledWith(expect.objectContaining({ close: 20 }))
    expect(onTotal).toHaveBeenCalledWith(expect.objectContaining({ close: 40 }))
    controller.dispose()
  })

  it('retries polling after errors and drops in-flight updates after unsubscribe or disposal', async () => {
    jest.useFakeTimers({ now: PERIOD.to * 1000 })
    const controller = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })
    const onRealtime = jest.fn()
    controller.datafeed.subscribeBars(PRICE.librarySymbolInfo, '60', onRealtime, 'price', jest.fn())
    mockedFetchPriceHistory.mockRejectedValueOnce(new Error('Offline'))
    await jest.advanceTimersByTimeAsync(30_000)
    expect(onRealtime).not.toHaveBeenCalled()
    await jest.advanceTimersByTimeAsync(30_000)
    expect(onRealtime).toHaveBeenCalledTimes(1)

    const pending = deferredHistory()
    mockedFetchPriceHistory.mockReturnValueOnce(pending.promise)
    await jest.advanceTimersByTimeAsync(30_000)
    controller.datafeed.unsubscribeBars('price')
    pending.resolve([{ ...BAR, close: 3 }])
    await jest.advanceTimersByTimeAsync(0)
    expect(onRealtime).toHaveBeenCalledTimes(1)
    controller.datafeed.subscribeBars(PRICE.librarySymbolInfo, '15', onRealtime, 'next', jest.fn())
    controller.dispose()
    await jest.advanceTimersByTimeAsync(60_000)
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(3)
  })

  it('requests USD history and maps timestamps and optional volume for TradingView', async () => {
    const bars = [
      { ...BAR, volume: 123.45 },
      { ...BAR, timestamp: BAR.timestamp + 3600 },
    ]
    mockedFetchPriceHistory.mockResolvedValue(bars)
    const onHistoryLoaded = jest.fn()
    const onResult = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS, onHistoryLoaded })

    datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchPriceHistory).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: CURRENCY.chainId, from: PERIOD.from, to: PERIOD.to, interval: '1h' }),
    )
    expect(onResult).toHaveBeenCalledWith(
      [
        { close: 2, high: 3, low: 1, open: 1.5, time: 1710000000000, volume: 123.45 },
        { close: 2, high: 3, low: 1, open: 1.5, time: 1710003600000 },
      ],
      { noData: false },
    )
    expect(onHistoryLoaded).toHaveBeenCalledWith(bars)
    expect(mockedFetchTokenSupply).not.toHaveBeenCalled()
  })

  it('caps future range ends at now and skips wholly future ranges', async () => {
    const now = PERIOD.to
    jest.spyOn(Date, 'now').mockReturnValue(now * 1000)
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })

    datafeed.getBars(PRICE.librarySymbolInfo, '1D', { ...PERIOD, to: now + 86400 }, jest.fn(), jest.fn())
    await flushTasks()
    expect(mockedFetchPriceHistory).toHaveBeenCalledWith(expect.objectContaining({ to: now, interval: '1d' }))

    mockedFetchPriceHistory.mockClear()
    const onResult = jest.fn()
    datafeed.getBars(
      PRICE.librarySymbolInfo,
      '1D',
      { ...PERIOD, from: now + 86400, to: now + 172800 },
      onResult,
      jest.fn(),
    )
    await flushTasks()
    expect(mockedFetchPriceHistory).not.toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
  })

  it('switches metric and supply with distinct symbols and precision while reusing USD history', async () => {
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })

    for (const [symbol, close, pricescale] of [
      [PRICE, 2, 1_000_000_000_000],
      [CIRCULATING_CAP, 20, 1],
      [TOTAL_CAP, 40, 1],
    ] as const) {
      const onResolve = jest.fn()
      datafeed.resolveSymbol(symbol.ticker, onResolve, jest.fn())
      await flushTasks()
      expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({ pricescale }))

      const onResult = jest.fn()
      datafeed.getBars(symbol.librarySymbolInfo, '60', PERIOD, onResult, jest.fn())
      await flushTasks()
      expect(onResult).toHaveBeenCalledWith([expect.objectContaining({ close })], { noData: false })
    }
    expect(new Set(SYMBOLS.map(({ ticker }) => ticker)).size).toBe(3)
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(1)
  })

  it('reports empty history through the native noData callback', async () => {
    mockedFetchPriceHistory.mockResolvedValue([])
    const onResult = jest.fn()
    const onError = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })

    datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, onResult, onError)
    await flushTasks()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onError).not.toHaveBeenCalled()
  })

  it('settles disabled backfill requests without fetching', async () => {
    const onResult = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })

    datafeed.getBars(PRICE.librarySymbolInfo, '1D', { ...PERIOD, firstDataRequest: false }, onResult, jest.fn())
    await flushTasks()
    expect(mockedFetchPriceHistory).not.toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
  })

  it('reports a native error and recovers when the interval changes', async () => {
    mockedFetchPriceHistory.mockRejectedValueOnce(new Error('No access'))
    const onResult = jest.fn()
    const onError = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS })

    datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, onResult, onError)
    await flushTasks()
    expect(onResult).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('No access')

    onError.mockClear()
    datafeed.getBars(PRICE.librarySymbolInfo, '15', PERIOD, onResult, onError)
    await flushTasks()
    expect(onResult).toHaveBeenCalledWith([expect.objectContaining({ close: 2 })], { noData: false })
    expect(onError).not.toHaveBeenCalled()
  })

  it('settles both requests without letting an older response replace newer summary history', async () => {
    const first = deferredHistory()
    const second = deferredHistory()
    mockedFetchPriceHistory.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const onHistoryLoaded = jest.fn()
    const firstResult = jest.fn()
    const secondResult = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: SYMBOLS, onHistoryLoaded })

    datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, firstResult, jest.fn())
    datafeed.getBars(PRICE.librarySymbolInfo, '60', { ...PERIOD, from: PERIOD.from - 3600 }, secondResult, jest.fn())
    const newerBars = [{ ...BAR, close: 3 }]
    second.resolve(newerBars)
    await flushTasks()
    first.resolve([BAR])
    await flushTasks()

    expect(firstResult).toHaveBeenCalledWith([expect.objectContaining({ close: 2 })], { noData: false })
    expect(secondResult).toHaveBeenCalledWith([expect.objectContaining({ close: 3 })], { noData: false })
    expect(onHistoryLoaded).toHaveBeenCalledTimes(1)
    expect(onHistoryLoaded).toHaveBeenCalledWith(newerBars)
  })

  it('restores cached summary history when returning to a symbol', async () => {
    const [other] = createChartSymbols([
      new Token(CURRENCY.chainId, '0x0000000000000000000000000000000000000002', 18, 'OTHER'),
    ])
    const onHistoryLoaded = jest.fn()
    const { datafeed, setActiveTicker } = createPriceChartDatafeed({
      queryClient,
      symbols: [PRICE, other],
      onHistoryLoaded,
    })

    datafeed.getBars(PRICE.librarySymbolInfo, '60', PERIOD, jest.fn(), jest.fn())
    await flushTasks()
    setActiveTicker(other.ticker)
    setActiveTicker(PRICE.ticker)

    expect(onHistoryLoaded).toHaveBeenCalledTimes(2)
    expect(onHistoryLoaded).toHaveBeenLastCalledWith([BAR])
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(1)
  })
})
