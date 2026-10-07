import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { createChartSymbols } from './symbolCatalog'
import { createPriceChartDatafeed } from './tradingViewDatafeed.service'

import { fetchPriceHistory } from '../api/fetchPriceHistory'
import { fetchTokenSupply } from '../api/fetchTokenSupply'

import type { ResolutionString } from './loadChartingLibrary'
import type { Candle } from './priceChart.types'
import type { PriceChartSymbolDescriptor } from './tradingView.types'

jest.mock('../api/fetchPriceHistory', () => ({ fetchPriceHistory: jest.fn() }))
jest.mock('../api/fetchTokenSupply', () => ({ fetchTokenSupply: jest.fn() }))

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

function createSymbolDescriptor(currency: Token): PriceChartSymbolDescriptor {
  return createChartSymbols([currency])[0]
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
    mockedFetchPriceHistory.mockReset()
    mockedFetchTokenSupply.mockReset()
  })

  it('does not advertise unsupported server time', async () => {
    const onReady = jest.fn()
    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange: jest.fn(),
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
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const onResolve = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ metric, onStatusChange: jest.fn(), symbols: [symbol] })

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
    const onStatusChange = jest.fn()
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
      metric: 'price',
      onHistoryLoaded,
      onStatusChange,
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
    expect(onStatusChange).toHaveBeenNthCalledWith(1, 'loading')
    expect(onStatusChange).toHaveBeenLastCalledWith(null)
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
        metric: 'price',
        onStatusChange: jest.fn(),
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

  it('scales USD history by circulating supply for market cap', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const onResult = jest.fn()

    mockedFetchPriceHistory.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    const { datafeed } = createPriceChartDatafeed({
      metric: 'marketCap',
      onStatusChange: jest.fn(),
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
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const onResult = jest.fn()

    mockedFetchPriceHistory.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    const { datafeed } = createPriceChartDatafeed({
      metric: 'marketCap',
      onStatusChange: jest.fn(),
      supplyVariant: 'total',
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(onResult).toHaveBeenCalledWith([{ close: 240, high: 360, low: 120, open: 180, time: 1710000000000 }], {
      noData: false,
    })
  })

  it('shows loading only for the first request for a symbol', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'USDC',
      }),
    )
    const onStatusChange = jest.fn()

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
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    await flushTasks()
    datafeed.getBars(symbol.librarySymbolInfo, '1D' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    await flushTasks()

    expect(onStatusChange.mock.calls.filter(([status]) => status === 'loading')).toEqual([['loading']])
  })

  it('shows an empty-state overlay when USD history is unavailable', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()
    mockedFetchPriceHistory.mockResolvedValue([])
    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

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
    expect(onStatusChange).toHaveBeenLastCalledWith('empty')
  })

  it('skips price chart calls for backfill requests when backfill is disabled', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '1D' as ResolutionString, BACKFILL_PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchPriceHistory).not.toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onStatusChange).not.toHaveBeenCalled()
  })
})

describe('createPriceChartDatafeed request lifecycle', () => {
  beforeEach(() => {
    mockedFetchPriceHistory.mockReset()
    mockedFetchTokenSupply.mockReset()
  })

  it('reports errors when all price chart requests fail', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0x0000000000000000000000000000000000000001',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceHistory.mockRejectedValue(new Error('No access'))

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(onResult).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('No access')
    expect(onStatusChange).toHaveBeenLastCalledWith('error')
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
      metric: 'price',
      onStatusChange: jest.fn(),
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
      metric: 'price',
      onHistoryLoaded,
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, firstOnResult, jest.fn())
    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, secondOnResult, jest.fn())

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
      metric: 'price',
      onHistoryLoaded,
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), onError)
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
      metric: 'price',
      onHistoryLoaded,
      onStatusChange: jest.fn(),
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
