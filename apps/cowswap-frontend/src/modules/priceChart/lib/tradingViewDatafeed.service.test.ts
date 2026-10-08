import { QueryClient } from '@tanstack/react-query'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { createChartSymbols } from './symbolCatalog'
import { createPriceChartDatafeed } from './tradingViewDatafeed.service'

import { fetchPriceHistory } from '../api/fetchPriceHistory'
import { fetchTokenSupply } from '../api/fetchTokenSupply'

import type { ResolutionString } from './loadChartingLibrary'
import type { Candle, ChartMetric, SupplyVariant } from './priceChart.types'
import type { PriceChartSymbolDescriptor } from './tradingView.types'

jest.mock('../api/fetchPriceHistory', () => ({ fetchPriceHistory: jest.fn() }))
jest.mock('../api/fetchTokenSupply', () => ({ fetchTokenSupply: jest.fn() }))

let queryClient: QueryClient

const mockedFetchPriceHistory = jest.mocked(fetchPriceHistory)
const mockedFetchTokenSupply = jest.mocked(fetchTokenSupply)

function createAsset(overrides: { address?: string; chainId?: SupportedChainId; symbol?: string }): Token {
  return new Token(
    overrides.chainId ?? SupportedChainId.MAINNET,
    overrides.address ?? '0x0000000000000000000000000000000000000001',
    18,
    overrides.symbol ?? 'TOKEN',
  )
}

function createDeferred<T>(): { promise: Promise<T>; reject: (error?: unknown) => void; resolve: (value: T) => void } {
  let resolvePromise!: (value: T) => void
  let rejectPromise!: (error?: unknown) => void

  return {
    promise: new Promise<T>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    }),
    reject: rejectPromise,
    resolve: resolvePromise,
  }
}

function createSymbolDescriptor(
  currency: Token,
  metric: ChartMetric = 'price',
  supplyVariant: SupplyVariant = 'circulating',
): PriceChartSymbolDescriptor {
  const symbol = createChartSymbols([currency]).find(
    (symbol) => symbol.metric === metric && symbol.supplyVariant === supplyVariant,
  )
  if (!symbol) throw new Error('Missing chart symbol')
  return symbol
}

function flushTasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

const PERIOD_PARAMS = {
  countBack: 300,
  firstDataRequest: true,
  from: 1710000000,
  to: 1710007200,
}

const BACKFILL_PERIOD_PARAMS = {
  ...PERIOD_PARAMS,
  firstDataRequest: false,
}

describe('createPriceChartDatafeed', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
    mockedFetchPriceHistory.mockReset()
    mockedFetchTokenSupply.mockReset()
  })

  it('does not advertise unsupported server time', async () => {
    const onReady = jest.fn()
    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      symbols: [],
    })

    datafeed.onReady(onReady)
    await flushTasks()

    expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ supports_time: false }))
    expect(datafeed.getServerTime).toBeUndefined()
  })

  it.each([
    ['price', 1_000_000_000_000],
    ['marketCap', 1],
  ] as const)('resolves %s history with its required precision', async (metric, pricescale) => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }), metric)
    const onResolve = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: [symbol] })

    datafeed.resolveSymbol(symbol.ticker, onResolve, jest.fn())
    await flushTasks()

    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({ pricescale }))
  })

  it('loads USD history and maps bars to TradingView format', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'USDC',
      }),
    )
    const onHistoryLoaded = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceHistory.mockResolvedValue([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
    ])

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      onHistoryLoaded,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceHistory).toHaveBeenCalledWith({
      address: '0x0000000000000000000000000000000000000001',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      interval: '1h',
      to: 1710007200,
    })
    expect(onResult).toHaveBeenCalledWith(
      [
        {
          close: 2,
          high: 3,
          low: 1,
          open: 1.5,
          time: 1710000000000,
        },
      ],
      { noData: false },
    )
    expect(onError).not.toHaveBeenCalled()
    expect(onHistoryLoaded).toHaveBeenCalledWith([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
    ])
    expect(mockedFetchTokenSupply).not.toHaveBeenCalled()
  })

  it('caps TradingView history ranges at now and skips wholly future ranges', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const now = 1710007200
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now * 1000)
    mockedFetchPriceHistory.mockResolvedValue([])

    try {
      const { datafeed } = createPriceChartDatafeed({
        queryClient,
        symbols: [symbol],
      })
      datafeed.getBars(symbol.librarySymbolInfo, '1D', { ...PERIOD_PARAMS, to: now + 86400 }, jest.fn(), jest.fn())
      await flushTasks()

      expect(mockedFetchPriceHistory).toHaveBeenCalledWith(
        expect.objectContaining({ from: PERIOD_PARAMS.from, interval: '1d', to: now }),
      )

      mockedFetchPriceHistory.mockClear()
      const onResult = jest.fn()
      datafeed.getBars(
        symbol.librarySymbolInfo,
        '1D',
        { ...PERIOD_PARAMS, from: now + 86400, to: now + 172800 },
        onResult,
        jest.fn(),
      )
      await flushTasks()

      expect(mockedFetchPriceHistory).not.toHaveBeenCalled()
      expect(onResult).toHaveBeenCalledWith([], { noData: true })
    } finally {
      clock.mockRestore()
    }
  })

  it('shares an in-flight price query across datafeeds', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const request = createDeferred<Candle[]>()
    mockedFetchPriceHistory.mockReturnValue(request.promise)
    const params = { queryClient, symbols: [symbol] }
    const first = createPriceChartDatafeed(params).datafeed
    const second = createPriceChartDatafeed(params).datafeed
    const firstResult = jest.fn()
    const secondResult = jest.fn()

    first.getBars(symbol.librarySymbolInfo, '60', PERIOD_PARAMS, firstResult, jest.fn())
    second.getBars(symbol.librarySymbolInfo, '60', PERIOD_PARAMS, secondResult, jest.fn())
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(1)

    request.resolve([])
    await flushTasks()
    expect(firstResult).toHaveBeenCalledWith([], { noData: true })
    expect(secondResult).toHaveBeenCalledWith([], { noData: true })
  })

  it('scales USD history by circulating supply for market cap', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }), 'marketCap')
    const onResult = jest.fn()

    mockedFetchPriceHistory.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchTokenSupply).toHaveBeenCalledWith(symbol.currency)
    expect(onResult).toHaveBeenCalledWith([{ close: 200, high: 300, low: 100, open: 150, time: 1710000000000 }], {
      noData: false,
    })
  })

  it('scales USD history by total supply when selected', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }), 'marketCap', 'total')
    const onResult = jest.fn()

    mockedFetchPriceHistory.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(onResult).toHaveBeenCalledWith([{ close: 240, high: 360, low: 120, open: 180, time: 1710000000000 }], {
      noData: false,
    })
  })

  it('switches metric and supply in one datafeed while reusing USD history', async () => {
    const symbols = createChartSymbols([createAsset({ symbol: 'COW' })])
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols })
    mockedFetchPriceHistory.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    for (const symbol of symbols) {
      const onResolve = jest.fn()
      datafeed.resolveSymbol(symbol.ticker, onResolve, jest.fn())
      await flushTasks()
      expect(onResolve).toHaveBeenCalledWith(
        expect.objectContaining({
          pricescale: symbol.metric === 'price' ? 1_000_000_000_000 : 1,
        }),
      )

      const onResult = jest.fn()
      datafeed.getBars(symbol.librarySymbolInfo, '60', PERIOD_PARAMS, onResult, jest.fn())
      await flushTasks()
      const multiplier = symbol.metric === 'price' ? 1 : symbol.supplyVariant === 'total' ? 120 : 100
      expect(onResult).toHaveBeenCalledWith([expect.objectContaining({ close: 2 * multiplier })], { noData: false })
    }
    expect(new Set(symbols.map(({ ticker }) => ticker)).size).toBe(3)
    expect(mockedFetchPriceHistory).toHaveBeenCalledTimes(1)
  })

  it('reports no data to TradingView when USD history is unavailable', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onResult = jest.fn()
    const onError = jest.fn()
    mockedFetchPriceHistory.mockResolvedValue([])
    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: [symbol] })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceHistory).toHaveBeenNthCalledWith(1, {
      address: '0x0000000000000000000000000000000000000001',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      interval: '1h',
      to: 1710007200,
    })
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onError).not.toHaveBeenCalled()
  })

  it('skips price chart calls for backfill requests when backfill is disabled', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: [symbol] })

    datafeed.getBars(symbol.librarySymbolInfo, '1D' as ResolutionString, BACKFILL_PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchPriceHistory).not.toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
  })
})

describe('createPriceChartDatafeed request lifecycle', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
    mockedFetchPriceHistory.mockReset()
    mockedFetchTokenSupply.mockReset()
  })

  it('reports a native error and recovers when the interval changes', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceHistory.mockRejectedValue(new Error('No access'))

    const { datafeed } = createPriceChartDatafeed({ queryClient, symbols: [symbol] })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(onResult).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('No access')

    mockedFetchPriceHistory.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    onError.mockClear()
    datafeed.getBars(symbol.librarySymbolInfo, '15' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(onResult).toHaveBeenCalledWith([expect.objectContaining({ close: 2 })], { noData: false })
    expect(onError).not.toHaveBeenCalled()
  })

  it('does not expose symbol search results', () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      symbols: [symbol],
    })

    datafeed.searchSymbols('COW', '', '', onResult)

    expect(onResult).toHaveBeenCalledWith([])
  })

  it('does not let an older successful request replace newer history', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const firstRequest = createDeferred<Candle[]>()
    const secondRequest = createDeferred<Candle[]>()
    const firstOnResult = jest.fn()
    const secondOnResult = jest.fn()
    const onHistoryLoaded = jest.fn()

    mockedFetchPriceHistory.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise)

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      onHistoryLoaded,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, firstOnResult, jest.fn())
    datafeed.getBars(
      symbol.librarySymbolInfo,
      '60' as ResolutionString,
      { ...PERIOD_PARAMS, from: PERIOD_PARAMS.from - 3600 },
      secondOnResult,
      jest.fn(),
    )

    secondRequest.resolve([
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        timestamp: 1710003600,
      },
    ])
    await flushTasks()
    firstRequest.resolve([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
    ])
    await flushTasks()

    expect(firstOnResult).toHaveBeenCalledWith(
      [
        {
          close: 2,
          high: 3,
          low: 1,
          open: 1.5,
          time: 1710000000000,
        },
      ],
      { noData: false },
    )
    expect(secondOnResult).toHaveBeenCalledWith(
      [
        {
          close: 4,
          high: 5,
          low: 3,
          open: 3.5,
          time: 1710003600000,
        },
      ],
      { noData: false },
    )
    expect(onHistoryLoaded).toHaveBeenCalledTimes(1)
    expect(onHistoryLoaded).toHaveBeenCalledWith([
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        timestamp: 1710003600,
      },
    ])
  })

  it('keeps successful history when a newer overlapping request fails', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const firstRequest = createDeferred<Candle[]>()
    const secondRequest = createDeferred<Candle[]>()
    const onHistoryLoaded = jest.fn()
    const onError = jest.fn()
    const bars = [{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }]

    mockedFetchPriceHistory.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise)

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      onHistoryLoaded,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    datafeed.getBars(
      symbol.librarySymbolInfo,
      '60' as ResolutionString,
      { ...PERIOD_PARAMS, from: PERIOD_PARAMS.from - 3600 },
      jest.fn(),
      onError,
    )
    firstRequest.resolve(bars)
    secondRequest.reject(new Error('failed'))
    await flushTasks()

    expect(onHistoryLoaded).toHaveBeenCalledWith(bars)
    expect(onError).toHaveBeenCalledWith('failed')
  })

  it('restores successful history when its symbol becomes active again', async () => {
    const cow = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const usdc = createSymbolDescriptor(
      createAsset({ symbol: 'USDC', address: '0x0000000000000000000000000000000000000002' }),
    )
    const bars = [{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }]
    const onHistoryLoaded = jest.fn()

    mockedFetchPriceHistory.mockResolvedValue(bars)

    const { datafeed } = createPriceChartDatafeed({
      queryClient,
      onHistoryLoaded,
      symbols: [cow, usdc],
    })

    datafeed.getBars(cow.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    await flushTasks()
    datafeed.resolveSymbol(usdc.ticker, jest.fn(), jest.fn())
    await flushTasks()
    datafeed.resolveSymbol(cow.ticker, jest.fn(), jest.fn())
    await flushTasks()

    expect(onHistoryLoaded).toHaveBeenCalledTimes(2)
    expect(onHistoryLoaded).toHaveBeenLastCalledWith(bars)
  })
})
